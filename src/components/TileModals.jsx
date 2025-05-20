import { useState, useRef, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function TileModals({ isOpen, onClose, tileConfig }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState(new Map());

  // Size conversion logic
  const sizeToPx = {
    "8x8": 8, // 8 inches
    "12x12": 12, // 12 inches
  };

  // Convert size to pixels for display
  const getTileSizeInPx = (size) => {
    const inches = sizeToPx[size] || 12;
    // Reverse the scale - larger number for smaller tiles
    // 8x8 should be largest, 16x16 should be smallest
    const scale = 96 - inches * 4; // This will give us 64px for 8x8, 48px for 12x12
    return `${scale}px`;
  };

  // Get the actual pixel size for the current tile
  const tileBgSize = getTileSizeInPx(tileConfig?.size);
  const tileSizePx = tileBgSize;

  const thicknessToPx = {
    none: "0px",
    thin: "2px",
    thick: "6px",
  };
  const groutThicknessPx = thicknessToPx[tileConfig?.thickness] || "2px";

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsFormOpen(false);
    }
  }, [isOpen, reset]);

  // Function to load and cache images
  const loadImage = (src) => {
    if (loadedImages.has(src)) {
      return Promise.resolve(loadedImages.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        loadedImages.set(src, img);
        resolve(img);
      };

      img.onerror = (e) => {
        console.error("Error loading image:", src, e);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  };

  // Function to draw tiles on canvas
  const drawTilesOnCanvas = async (canvas, ctx) => {
    if (!canvas || !tileConfig?.tile) return;

    // Get the actual size in inches
    const sizeInInches = sizeToPx[tileConfig.size] || 12;

    // Reverse the grid size logic
    // Smaller tiles (16x16) should show more tiles, larger tiles (8x8) should show fewer
    const gridSize = Math.max(2, Math.ceil(sizeInInches / 4));
    const tileSize = canvas.width / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Load base tile image
      let baseImage = null;
      if (tileConfig.tile.image) {
        try {
          baseImage = await loadImage(tileConfig.tile.image);
        } catch (error) {
          console.error("Failed to load base tile image:", error);
          return;
        }
      }

      // Load mask images
      const maskImages = [];
      if (tileConfig.tile.masks && tileConfig.tile.masks.length > 0) {
        for (const mask of tileConfig.tile.masks) {
          if (mask.image) {
            try {
              const maskImg = await loadImage(mask.image);
              maskImages.push({ image: maskImg, mask });
            } catch (error) {
              console.error("Failed to load mask image:", error);
            }
          }
        }
      }

      // Draw tiles in a grid pattern
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const x = col * tileSize;
          const y = row * tileSize;

          // Draw base tile with proper scaling
          if (baseImage) {
            ctx.save();
            // Maintain aspect ratio while scaling
            const scale = Math.min(
              tileSize / baseImage.width,
              tileSize / baseImage.height
            );
            const scaledWidth = baseImage.width * scale;
            const scaledHeight = baseImage.height * scale;

            const offsetX = (tileSize - scaledWidth) / 2;
            const offsetY = (tileSize - scaledHeight) / 2;

            ctx.drawImage(
              baseImage,
              x + offsetX,
              y + offsetY,
              scaledWidth,
              scaledHeight
            );
            ctx.restore();
          }

          // Draw masks with proper scaling
          maskImages.forEach(({ image, mask }) => {
            ctx.save();
            const scale = Math.min(
              tileSize / image.width,
              tileSize / image.height
            );
            const scaledWidth = image.width * scale;
            const scaledHeight = image.height * scale;
            const offsetX = (tileSize - scaledWidth) / 2;
            const offsetY = (tileSize - scaledHeight) / 2;

            ctx.globalCompositeOperation = "source-in";
            ctx.drawImage(
              image,
              x + offsetX,
              y + offsetY,
              scaledWidth,
              scaledHeight
            );
            ctx.globalCompositeOperation = "source-atop";
            ctx.fillStyle = mask.color;
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.restore();
          });

          // Draw grout with proper scaling
          if (tileConfig.thickness !== "none") {
            const groutWidth = parseInt(groutThicknessPx);
            ctx.fillStyle = tileConfig.groutColor || "#333333";
            // Vertical grout
            ctx.fillRect(x - groutWidth / 2, y, groutWidth, tileSize);
            // Horizontal grout
            ctx.fillRect(x, y - groutWidth / 2, tileSize, groutWidth);
          }
        }
      }

      // Add size indicator with more visible styling
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.font = "bold 20px Arial";
      ctx.fillText(`${sizeInInches}" x ${sizeInInches}"`, 20, 40);
      ctx.restore();
    } catch (error) {
      console.error("Error in drawing process:", error);
    }
  };

  // Effect to draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to maintain aspect ratio
    canvas.width = 800;
    canvas.height = 800;

    drawTilesOnCanvas(canvas, ctx);
  }, [tileConfig]);

  const tileSizes = [
    { value: "8x8", label: '8" x 8"' },
    { value: "12x12", label: '12" x 12"' },
    { value: "Box", label: "Box" },
    { value: "custom", label: "Custom Size" },
  ];

  // Add this function before generatePDF
  const ensureCanvasDrawn = async (canvas) => {
    return new Promise((resolve) => {
      if (canvas.getContext("2d").getImageData(0, 0, 1, 1).data[3] !== 0) {
        resolve();
      } else {
        setTimeout(() => ensureCanvasDrawn(canvas), 100);
      }
    });
  };

  const generatePDF = async (formData) => {
    try {
      console.log("Starting PDF generation...");
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Add logo Header & Company Information
      try {
        const logoUrl = "/Images/logo.png";
        pdf.addImage(logoUrl, "PNG", margin, 15, 30, 30);
        console.log("Logo added successfully");
      } catch (error) {
        console.error("Error adding logo:", error);
      }

      // Title and company info
      pdf.setFontSize(14);
      pdf.text("Tile Configuration Details", pageWidth / 2, 30, {
        align: "center",
      });

      pdf.setFontSize(8);
      pdf.text("1325 Exchange Drive", pageWidth - margin, 20, {
        align: "right",
      });
      pdf.text("Richardson, TX 75081", pageWidth - margin, 25, {
        align: "right",
      });
      pdf.text("Phone: 214-352-0000", pageWidth - margin, 30, {
        align: "right",
      });

      // Draw a horizontal line below the header
      pdf.setDrawColor(139, 0, 0);
      pdf.line(margin, 60, pageWidth - margin, 60);

      let yPosition = 80;

      // Personal Information Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Personal Information", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);
      const personalInfo = [
        { label: "Name", value: formData.name },
        { label: "Email", value: formData.email },
        { label: "Phone", value: formData.phone },
        { label: "Reference", value: formData.reference || "N/A" },
      ];

      personalInfo.forEach((info) => {
        pdf.text(`${info.label}: ${info.value}`, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Tile Information Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Tile Information", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Calculate the width for text and images
      const textWidth = pageWidth * 0.4;
      const imageWidth = pageWidth * 0.5;
      const imageStartX = pageWidth - imageWidth - margin;

      // Tile Information text on the left
      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);
      const tileInfo = [
        { label: "Tile Name", value: tileConfig?.tile?.name || "N/A" },
        { label: "Quantity", value: formData.quantity },
        { label: "Size", value: formData.tileSize },
        {
          label: "Color",
          value: tileConfig?.tile?.color || tileConfig?.color || "N/A",
        },
        { label: "Grout Color", value: tileConfig?.groutColor || "N/A" },
        { label: "Grout Thickness", value: tileConfig?.thickness || "N/A" },
        {
          label: "Environment",
          value: tileConfig?.environment?.label || "N/A",
        },
      ];

      let textYPosition = yPosition;
      let imageYPosition = yPosition;

      tileInfo.forEach((info) => {
        pdf.text(`${info.label}: ${info.value}`, margin, textYPosition);
        textYPosition += 8;
      });

      // Add tile previews on the right
      if (previewRef.current) {
        console.log("Processing previews...");
        try {
          const previewSections =
            previewRef.current.querySelectorAll(".border.rounded-lg");

          for (let i = 0; i < previewSections.length; i++) {
            console.log(`Processing preview section ${i + 1}...`);
            const previewContainer = previewSections[i].querySelector(
              ".w-full.rounded-lg.overflow-hidden.relative"
            );

            if (previewContainer) {
              const previewHeight = imageWidth * 0.4;

              try {
                // Wait for all images to load
                const images = previewContainer.getElementsByTagName("img");
                await Promise.all(
                  Array.from(images).map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                      img.onload = resolve;
                      img.onerror = resolve;
                    });
                  })
                );

                // Use html2canvas to capture the preview container
                const canvas = await html2canvas(previewContainer, {
                  scale: 2,
                  useCORS: true,
                  allowTaint: true,
                  backgroundColor: "#ffffff",
                  logging: true,
                  onclone: (clonedDoc) => {
                    // Ensure all styles are preserved
                    const clonedContainer = clonedDoc.querySelector(
                      ".w-full.rounded-lg.overflow-hidden.relative"
                    );
                    if (clonedContainer) {
                      clonedContainer.style.width = `${previewContainer.offsetWidth}px`;
                      clonedContainer.style.height = `${previewContainer.offsetHeight}px`;
                    }
                  },
                });

                // Add the captured image to the PDF
                const imgData = canvas.toDataURL("image/png", 1.0);
                pdf.addImage(
                  imgData,
                  "PNG",
                  imageStartX,
                  imageYPosition,
                  imageWidth,
                  previewHeight
                );

                imageYPosition += previewHeight + 20;

                if (imageYPosition > pageHeight - 50) {
                  pdf.addPage();
                  imageYPosition = margin;
                }

                console.log(`Preview section ${i + 1} processed successfully`);
              } catch (error) {
                console.error(
                  `Error processing preview section ${i + 1}:`,
                  error
                );
                continue;
              }
            }
          }
        } catch (error) {
          console.error("Error processing previews:", error);
        }
      }

      // Add thank you message
      const lastYPosition = Math.max(textYPosition, imageYPosition) + 20;
      if (lastYPosition < pageHeight - 50) {
        pdf.setFontSize(16);
        pdf.setTextColor(139, 0, 0);
        pdf.text("Thank You!", pageWidth / 2, lastYPosition, {
          align: "center",
        });
        let thankYouY = lastYPosition + 10;

        pdf.setFontSize(12);
        pdf.setTextColor(51, 51, 51);
        const thankYouMessage =
          "Thank you for shopping with us! We appreciate your business and hope you love your new tile selection. If you have any questions or need assistance, please don't hesitate to contact us.";
        const splitMessage = pdf.splitTextToSize(
          thankYouMessage,
          pageWidth - margin * 2
        );
        pdf.text(splitMessage, pageWidth / 2, thankYouY, { align: "center" });
        thankYouY += splitMessage.length * 8 + 10;

        pdf.setFontSize(10);
        pdf.setTextColor(139, 0, 0);
        pdf.text("Contact Us:", pageWidth / 2, thankYouY, { align: "center" });
        thankYouY += 8;
        pdf.text("Email: support@tilesimulator.com", pageWidth / 2, thankYouY, {
          align: "center",
        });
        thankYouY += 8;
        pdf.text("Phone: 214-352-0000", pageWidth / 2, thankYouY, {
          align: "center",
        });
      }

      console.log("Generating PDF blob...");
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);

      console.log("Creating download link...");
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "tile-configuration.pdf";
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Cleanup
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      console.log("PDF generation completed successfully");

      // Send email
      const storeOwnerEmail = "store@tilesimulator.com";
      const emailSubject = "New Tile Configuration Request";
      const emailBody = `
        New tile configuration request received:
        
        Customer Details:
        Name: ${formData.name}
        Email: ${formData.email}
        Phone: ${formData.phone}
        Reference: ${formData.reference || "N/A"}
        
        Tile Configuration:
        Tile Name: ${tileConfig?.tile?.name || "N/A"}
        Quantity: ${formData.quantity}
        Size: ${formData.tileSize}
        Color: ${tileConfig?.tile?.color || tileConfig?.color || "N/A"}
        Grout Color: ${tileConfig?.groutColor || "N/A"}
        Grout Thickness: ${tileConfig?.thickness || "N/A"}
        Environment: ${tileConfig?.environment?.label || "N/A"}
      `;

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: storeOwnerEmail,
            subject: emailSubject,
            body: emailBody,
            pdfBlob: pdfBlob,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send email");
        }
      } catch (error) {
        console.error("Error sending email:", error);
        const mailtoLink = `mailto:${storeOwnerEmail}?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
      }
    } catch (error) {
      console.error("Error in PDF generation:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    await generatePDF(data);
    reset(); // Reset form after submission
    setIsFormOpen(false); // Close form view
    onClose(); // Close modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl w-full max-w-4xl overflow-y-auto max-h-[80vh] lg:max-h-max">
        {!isFormOpen ? (
          <div>
            <div className="flex justify-end">
              <button
                onClick={() => onClose()}
                className="bg-black bg-opacity-70 text-white rounded-full p-1 hover:bg-[#bd5b4c] transition=all duration-300 ease-in-out"
              >
                <IoMdClose size={16} />
              </button>
            </div>
            <div className="flex gap-6 flex-wrap">
              <div className="max-w-[20%] h-20">
                <img
                  src="/Images/logo.png"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-light font-poppins italic">
                <h3 className="text-lg tracking-wide font-normal">
                  Lili Cement Tile Line
                </h3>
                <a
                  href="https://www.google.com/maps?q=1325+Exchange+Drive+Richardson,+TX+75081"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-[#bd5b4c] transition-all duration-300 ease-in-out"
                >
                  1325 Exchange Drive <br /> Richardson, TX 75081
                </a>
                <br />
                <a
                  href="tel:2143520000"
                  className="text-sm text-gray-700 hover:text-[#bd5b4c] transition-all duration-300 ease-in-out"
                >
                  Tel: 214-352-0000
                </a>
                <br />
                <a
                  href="fax:2153520002"
                  className="text-sm text-gray-700 hover:text-[#bd5b4c] transition-all duration-300 ease-in-out"
                >
                  Fax: 215-352-0002
                </a>
              </div>

              <div className="font-light font-poppins">
                <br />
                <a
                  href="https://www.google.com/maps?q=8+East+Stow+Road+Suite+2000+Marlton,+NJ+08053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-[#bd5b4c] transition-all duration-300 ease-in-out"
                >
                  8 East Stow Road <br /> Suite 2000 <br /> Marlton, NJ 08053
                </a>
                <br />
                <a
                  href="tel:8569881802"
                  className="text-sm text-gray-700 hover:text-[#bd5b4c] transition-all duration-300 ease-in-out"
                >
                  Phone: 856-988-1802
                </a>{" "}
                <br />
                <a
                  href="fax:8569881803"
                  className="text-sm text-gray-700 hover:text-[#bd5b4c] transition-all duration-300 ease-in-out"
                >
                  Fax: 856-988-1803
                </a>
              </div>
            </div>

            {/* Configuration Details */}
            <div className="rounded-lg pt-4 font-poppins font-light mt-4 mb-4 text-sm space-y-2">
              <h3 className="font-semibold font-poppins uppercase text-lg ">
                Selected Configuration:
              </h3>
              <p>Tile Name: {tileConfig?.tile?.name || "N/A"}</p>
              <p>Tile Size: {tileConfig?.size}</p>
              <p>Color: {tileConfig?.color}</p>
              <p>Grout Color: {tileConfig?.groutColor}</p>
              <p>Grout Thickness: {tileConfig?.thickness}</p>
              {tileConfig?.environment && (
                <p>Environment: {tileConfig.environment.label}</p>
              )}
            </div>
            <div
              ref={previewRef}
              className="grid grid-cols-1 sm:grid-cols-2 space-y-6"
            >
              {/* Tile Pattern Without Environment */}
              <div className="rounded-lg pt-4">
                <h3 className="mb-4 font-light font-poppins">Tile Pattern</h3>
                <div
                  className="w-full rounded-lg overflow-hidden relative"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "auto",
                    minHeight: "200px",
                  }}
                >
                  {/* Original Tile Image */}
                  <div className="relative w-full max-h-[500px]">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-contain bg-gray-100"
                    />

                    {/* Mask Layers */}
                    {tileConfig?.tile?.masks &&
                      tileConfig.tile.masks.map((mask) => (
                        <div
                          key={mask.id}
                          className="absolute inset-0"
                          style={{
                            backgroundColor: mask.color,
                            maskImage: `url(${mask.image})`,
                            WebkitMaskImage: `url(${mask.image})`,
                            maskSize: tileBgSize,
                            WebkitMaskSize: tileBgSize,
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                            maskRepeat: "repeat",
                            WebkitMaskRepeat: "repeat",
                            mixBlendMode: "source-in",
                            zIndex: 1,
                          }}
                        />
                      ))}

                    {/* Border Mask Layers */}
                    {tileConfig?.borderMasks &&
                      tileConfig.borderMasks.map((mask) => (
                        <div
                          key={mask.maskId}
                          className="absolute inset-0"
                          style={{
                            backgroundColor: mask.color,
                            maskImage: `url(${mask.image})`,
                            WebkitMaskImage: `url(${mask.image})`,
                            maskSize: "100%",
                            WebkitMaskSize: "100%",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            mixBlendMode: "source-in",
                            zIndex: 3,
                          }}
                        />
                      ))}

                    {/* Grout overlay */}
                    {tileConfig?.thickness !== "none" && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: "none",
                          backgroundImage: `
                            repeating-linear-gradient(
                              to right,
                              ${tileConfig?.groutColor || "#333333"},
                              ${
                                tileConfig?.groutColor || "#333333"
                              } ${groutThicknessPx},
                              transparent ${groutThicknessPx},
                              transparent ${tileSizePx}
                            ),
                            repeating-linear-gradient(
                              to bottom,
                              ${tileConfig?.groutColor || "#333333"},
                              ${
                                tileConfig?.groutColor || "#333333"
                              } ${groutThicknessPx},
                              transparent ${groutThicknessPx},
                              transparent ${tileSizePx}
                            )
                          `,
                          backgroundSize: `${tileSizePx} ${tileSizePx}`,
                          backgroundRepeat: "repeat",
                          backgroundPosition: "center",
                          opacity: 1,
                          zIndex: 2,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Tile Pattern With Environment */}
              {tileConfig?.environment && (
                <div className="rounded-lg p-4">
                  <h3 className="mb-4 font-light font-poppins">
                    Tile in Environment
                  </h3>
                  <div
                    className="w-full rounded-lg overflow-hidden relative"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: "auto",
                      minHeight: "200px",
                    }}
                  >
                    {/* Environment background */}
                    <img
                      src={tileConfig.environment.image}
                      alt="Room preview"
                      className="w-full h-full object-cover absolute inset-0"
                      style={{
                        zIndex: 3,
                      }}
                    />
                    {/* Original Tile Image */}
                    <div className="relative w-full max-h-[500px]">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full object-contain bg-gray-100"
                      />

                      {/* Mask Layers */}
                      {tileConfig?.tile?.masks &&
                        tileConfig.tile.masks.map((mask) => (
                          <div
                            key={mask.id}
                            className="absolute inset-0"
                            style={{
                              backgroundColor: mask.color,
                              maskImage: `url(${mask.image})`,
                              WebkitMaskImage: `url(${mask.image})`,
                              maskSize: tileBgSize,
                              WebkitMaskSize: tileBgSize,
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                              maskRepeat: "repeat",
                              WebkitMaskRepeat: "repeat",
                              mixBlendMode: "source-in",
                              opacity: 0.8,
                              zIndex: 1,
                            }}
                          />
                        ))}

                      {/* Border Mask Layers */}
                      {tileConfig?.borderMasks &&
                        tileConfig.borderMasks.map((mask) => (
                          <div
                            key={mask.maskId}
                            className="absolute inset-0"
                            style={{
                              backgroundColor: mask.color,
                              maskImage: `url(${mask.image})`,
                              WebkitMaskImage: `url(${mask.image})`,
                              maskSize: "100%",
                              WebkitMaskSize: "100%",
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                              maskRepeat: "no-repeat",
                              WebkitMaskRepeat: "no-repeat",
                              mixBlendMode: "source-in",
                              opacity: 0.8,
                              zIndex: 3,
                            }}
                          />
                        ))}

                      {/* Grout overlay */}
                      {tileConfig?.thickness !== "none" && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: "none",
                            backgroundImage: `
                              repeating-linear-gradient(
                                to right,
                                ${tileConfig?.groutColor || "#333333"},
                                ${
                                  tileConfig?.groutColor || "#333333"
                                } ${groutThicknessPx},
                                transparent ${groutThicknessPx},
                                transparent ${tileSizePx}
                              ),
                              repeating-linear-gradient(
                                to bottom,
                                ${tileConfig?.groutColor || "#333333"},
                                ${
                                  tileConfig?.groutColor || "#333333"
                                } ${groutThicknessPx},
                                transparent ${groutThicknessPx},
                                transparent ${tileSizePx}
                              )
                            `,
                            backgroundSize: `${tileSizePx} ${tileSizePx}`,
                            backgroundRepeat: "repeat",
                            backgroundPosition: "center",
                            opacity: 1,
                            zIndex: 2,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="mt-6 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 text-base  w-full  font-poppins"
              onClick={() => setIsFormOpen(true)}
            >
              Send Yourself a Copy!
            </button>
          </div>
        ) : (
          // Form Screen
          <div className="font-poppins">
            <button
              onClick={() => setIsFormOpen(false)}
              className="flex items-center text-[#bd5b4c] hover:text-red-700 mb-6 transition-all duration-300 ease-in-out"
            >
              <IoArrowBack size={16} />
              <span className="ml-1 font-light">Back</span>
            </button>
            <h2 className="text-2xl  mb-6">Your Details</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-light">
                    Name
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  />
                  {errors.name && (
                    <p className="text-[#bd5b4c] text-sm mt-1 font-light">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm  text-gray-700 mb-2 font-light">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  />
                  {errors.email && (
                    <p className="text-[#bd5b4c] text-sm mt-1 font-light">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm  text-gray-700 mb-2 font-light">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  />
                  {errors.phone && (
                    <p className="text-[#bd5b4c] text-sm mt-1 font-light">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm  text-gray-700 mb-2 font-light">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    {...register("reference")}
                    className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Tile Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Tile Quantity
                  </label>
                  <input
                    type="number"
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 1, message: "Quantity must be at least 1" },
                    })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                    min="1"
                  />
                  {errors.quantity && (
                    <p className="text-[#bd5b4c] text-sm mt-1 font-light">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Tile Size
                  </label>
                  <select
                    {...register("tileSize", {
                      required: "Tile size is required",
                    })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  >
                    <option value="" className="font-light font-poppins">
                      Select size
                    </option>
                    {tileSizes.map((size) => (
                      <option
                        key={size.value}
                        value={size.value}
                        className="font-light font-poppins"
                      >
                        {size.label}
                      </option>
                    ))}
                  </select>
                  {errors.tileSize && (
                    <p className="text-[#bd5b4c] text-sm mt-1 font-light">
                      {errors.tileSize.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm  text-gray-700 mb-2 font-light">
                  Message
                </label>
                <textarea
                  {...register("message")}
                  rows="4"
                  className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  placeholder="Any additional information or requirements..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    onClose();
                  }}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 text-base"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
