import { useState, useRef, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function TileModals({ isOpen, onClose, tileConfig }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const previewRef = useRef(null);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsFormOpen(false);
    }
  }, [isOpen, reset]);

  const tileSizes = [
    { value: "8x8", label: "8\" x 8\"" },
    { value: "12x12", label: "12\" x 12\"" },
    { value: "Box", label: "Box" },
    { value: "custom", label: "Custom Size" }
  ];

  const generatePDF = async (formData) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // Add logo Header & Company Information
     // Header Section Heights and X positions
   const logoX = margin;
      const centerX = pageWidth / 2;
      const rightX = pageWidth - margin;

      // Logo
      const logoUrl = '/Images/logo.png'; // Make sure this path is correct and accessible
      pdf.addImage(logoUrl, 'PNG', logoX, 15, 40, 40);

      // Title - Centered
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Tile Configuration Details", centerX, 25, { align: "center" });

      // Right-Aligned Company Info
      pdf.setFontSize(10);
      const rightText = [
        "1325 Exchange Drive",
        "Richardson, TX 75081",
        "Phone: 214-352-0000",
        "Fax: 215-352-0002"
      ];
      rightText.forEach((line, idx) => {
        pdf.text(line, rightX, 15 + (idx * 6), { align: "right" });
      });

      // Draw a horizontal line below the header
      pdf.setDrawColor(139, 0, 0); // Dark Red RGB color for the line
      pdf.line(margin, 60, pageWidth - margin, 60);

      let yPosition = 70;

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
        { label: "Reference", value: formData.reference || 'N/A' }
      ];

      personalInfo.forEach(info => {
        pdf.text(`${info.label}: ${info.value}`, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Tile Information Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Tile Information", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);
      const tileInfo = [
        { label: "Tile Name", value: tileConfig?.tile?.name || 'N/A' },
        { label: "Quantity", value: formData.quantity },
        { label: "Size", value: formData.tileSize },
        { label: "Color", value: tileConfig?.color || 'N/A' },
        { label: "Grout Color", value: tileConfig?.groutColor || 'N/A' },
        { label: "Grout Thickness", value: tileConfig?.thickness || 'N/A' },
        { label: "Environment", value: tileConfig?.environment?.label || 'N/A' }
      ];

      tileInfo.forEach(info => {
        pdf.text(`${info.label}: ${info.value}`, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Add tile previews
      if (previewRef.current) {
        try {
          // Get all preview sections
          const previewSections = previewRef.current.querySelectorAll('.border.rounded-lg');

          for (let i = 0; i < previewSections.length; i++) {
            // Check if we need a new page
            if (yPosition > pageHeight - 100) {
              pdf.addPage();
              yPosition = margin;
            }

            // Add section title
            const title = previewSections[i].querySelector('h3')?.textContent || '';
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.text(title, margin, yPosition);
            yPosition += 10;

            // Get the preview container
            const previewContainer = previewSections[i].querySelector('.w-full.rounded-lg.overflow-hidden.relative');
            if (previewContainer) {
              // Set a fixed size for the preview
              const previewWidth = pageWidth - (margin * 2);
              const previewHeight = previewWidth * 0.6;

              // Wait for images to load
              await new Promise(resolve => setTimeout(resolve, 2000));

              // Capture the preview with improved settings
              const canvas = await html2canvas(previewContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: true,
                onclone: (clonedDoc) => {
                  // Ensure all images are loaded in the cloned document
                  const images = clonedDoc.getElementsByTagName('img');
                  Array.from(images).forEach(img => {
                    img.crossOrigin = 'anonymous';
                    // Force image to load
                    if (!img.complete) {
                      img.src = img.src;
                    }
                  });
                }
              });

              // Add the preview to the PDF
              const imgData = canvas.toDataURL('image/png', 1.0);
              pdf.addImage(imgData, 'PNG', margin, yPosition, previewWidth, previewHeight);
              yPosition += previewHeight + 20;
            }
          }
        } catch (error) {
          console.error('Error generating preview:', error);
        }
      }

      // Add thank you message if there's space
    if (yPosition < pageHeight - 100) {
        pdf.setFontSize(16);
        pdf.setTextColor(139, 0, 0); // Dark Red RGB for "Thank You!" message
        pdf.text("Thank You!", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setTextColor(51, 51, 51);
        const thankYouMessage = "Thank you for shopping with us! We appreciate your business and hope you love your new tile selection. If you have any questions or need assistance, please don't hesitate to contact us.";
        const splitMessage = pdf.splitTextToSize(thankYouMessage, pageWidth - (margin * 2));
        pdf.text(splitMessage, pageWidth / 2, yPosition, { align: "center" });
        yPosition += splitMessage.length * 8 + 10;

        // Add contact information with dark red color
        pdf.setFontSize(10);
        pdf.setTextColor(139, 0, 0); // Dark Red for contact information
        pdf.text("Contact Us:", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
        pdf.text("Email: support@tilesimulator.com", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
        pdf.text("Phone: 214-352-0000", pageWidth / 2, yPosition, { align: "center" });
      }
      // Generate blob and create download link
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Create and trigger download link
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'tile-configuration.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Cleanup
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      // Send email to store owner automatically
      const storeOwnerEmail = "store@tilesimulator.com"; // Replace with actual store owner email
      const emailSubject = "New Tile Configuration Request";
      const emailBody = `
        New tile configuration request received:
        
        Customer Details:
        Name: ${formData.name}
        Email: ${formData.email}
        Phone: ${formData.phone}
        Reference: ${formData.reference || 'N/A'}
        
        Tile Configuration:
        Tile Name: ${tileConfig?.tile?.name || 'N/A'}
        Quantity: ${formData.quantity}
        Size: ${formData.tileSize}
        Color: ${tileConfig?.color || 'N/A'}
        Grout Color: ${tileConfig?.groutColor || 'N/A'}
        Grout Thickness: ${tileConfig?.thickness || 'N/A'}
        Environment: ${tileConfig?.environment?.label || 'N/A'}
      `;

      // Send email using a server endpoint
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: storeOwnerEmail,
            subject: emailSubject,
            body: emailBody,
            pdfBlob: pdfBlob
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        // Fallback to mailto if server endpoint fails
        const mailtoLink = `mailto:${storeOwnerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
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
                className="bg-black bg-opacity-70 text-white rounded-full p-1 hover:bg-red-500 transition=all duration-300 ease-in-out"
              >
                <IoMdClose size={16} />
              </button>
            </div>
            <div className="flex gap-6 flex-wrap">
              <div className="max-w-[20%] h-20">
                <img src="/Images/logo.png" alt="" className="w-full h-full object-contain" />
              </div>
              <div className="font-light font-poppins italic">
                <h3 className="text-lg tracking-wide font-normal">Lili Cement Tile Line</h3>
                <a
                  href="https://www.google.com/maps?q=1325+Exchange+Drive+Richardson,+TX+75081"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-red-500 transition-all duration-300 ease-in-out"
                >
                  1325 Exchange Drive <br /> Richardson, TX 75081
                </a>
                <br />
                <a href="tel:2143520000" className="text-sm text-gray-700 hover:text-red-500 transition-all duration-300 ease-in-out">Tel: 214-352-0000</a><br />
                <a href="fax:2153520002" className="text-sm text-gray-700 hover:text-red-500 transition-all duration-300 ease-in-out">Fax: 215-352-0002</a>
              </div>

              <div className="font-light font-poppins">
                <br />
                <a
                  href="https://www.google.com/maps?q=8+East+Stow+Road+Suite+2000+Marlton,+NJ+08053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-red-500 transition-all duration-300 ease-in-out"
                >
                  8 East Stow Road <br /> Suite 2000 <br /> Marlton, NJ 08053
                </a>
                <br />
                <a href="tel:8569881802" className="text-sm text-gray-700 hover:text-red-500 transition-all duration-300 ease-in-out">Phone: 856-988-1802</a> <br />
                <a href="fax:8569881803" className="text-sm text-gray-700 hover:text-red-500 transition-all duration-300 ease-in-out">Fax: 856-988-1803</a>
              </div>
            </div>

            {/* Configuration Details */}
            <div className="rounded-lg pt-4 font-poppins font-light mt-4 mb-4 text-sm space-y-2">
              <h3 className="font-bold  font-semibold font-poppins uppercase text-lg ">Selected Configuration:</h3>
              <p>Tile Name: {tileConfig?.tile?.name || 'N/A'}</p>
              <p>Tile Size: {tileConfig?.size}</p>
              <p>Color: {tileConfig?.color}</p>
              <p>Grout Color: {tileConfig?.groutColor}</p>
              <p>Grout Thickness: {tileConfig?.thickness}</p>
              {tileConfig?.environment && (
                <p>Environment: {tileConfig.environment.label}</p>
              )}
            </div>
            <div ref={previewRef} className="grid grid-cols-1 sm:grid-cols-2 space-y-6">
              {/* Tile Pattern Without Environment */}
              <div className="rounded-lg pt-4">
                <h3 className="font-bold mb-4 font-light font-poppins">Tile Pattern</h3>
                <div
                  className="w-full rounded-lg overflow-hidden relative"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "auto",
                    minHeight: "200px",
                  }}
                >
                  {/* Tile pattern */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${tileConfig?.tile?.img})`,
                      backgroundSize: tileConfig?.size ? `${tileConfig.size}px ${tileConfig.size}px` : '100px 100px',
                      backgroundRepeat: "repeat",
                      backgroundPosition: "center",
                      opacity: 1,
                      zIndex: 1,
                      backgroundColor: tileConfig?.color || '#ffffff',
                    }}
                  />
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
                        zIndex: 2,
                        backgroundImage: `
                          repeating-linear-gradient(
                            to right,
                            ${tileConfig?.groutColor || '#333333'},
                            ${tileConfig?.groutColor || '#333333'} ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                            transparent ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                            transparent ${tileConfig?.size || '100px'}
                          ),
                          repeating-linear-gradient(
                            to bottom,
                            ${tileConfig?.groutColor || '#333333'},
                            ${tileConfig?.groutColor || '#333333'} ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                            transparent ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                            transparent ${tileConfig?.size || '100px'}
                          )
                        `,
                        backgroundSize: `${tileConfig?.size || '100px'} ${tileConfig?.size || '100px'}`,
                        backgroundRepeat: "repeat",
                        backgroundPosition: "center",
                        opacity: 1,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Tile Pattern With Environment */}
              {tileConfig?.environment && (
                <div className="rounded-lg p-4">
                  <h3 className="font-bold mb-4 font-light font-poppins">Tile in Environment</h3>
                  <div
                    className="w-full rounded-lg overflow-hidden relative"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: "auto",
                      minHeight: "200px",
                    }}
                  >
                    {/* Tile pattern */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${tileConfig?.tile?.img})`,
                        backgroundSize: tileConfig?.size ? `${tileConfig.size}px ${tileConfig.size}px` : '100px 100px',
                        backgroundRepeat: "repeat",
                        backgroundPosition: "center",
                        opacity: 1,
                        zIndex: 1,
                        backgroundColor: tileConfig?.color || '#ffffff',
                      }}
                    />
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
                          zIndex: 2,
                          backgroundImage: `
                            repeating-linear-gradient(
                              to right,
                              ${tileConfig?.groutColor || '#333333'},
                              ${tileConfig?.groutColor || '#333333'} ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                              transparent ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                              transparent ${tileConfig?.size || '100px'}
                            ),
                            repeating-linear-gradient(
                              to bottom,
                              ${tileConfig?.groutColor || '#333333'},
                              ${tileConfig?.groutColor || '#333333'} ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                              transparent ${tileConfig?.thickness === "thick" ? '6px' : '2px'},
                              transparent ${tileConfig?.size || '100px'}
                            )
                          `,
                          backgroundSize: `${tileConfig?.size || '100px'} ${tileConfig?.size || '100px'}`,
                          backgroundRepeat: "repeat",
                          backgroundPosition: "center",
                          opacity: 1,
                        }}
                      />
                    )}
                    {/* Environment background */}
                    <img
                      src={tileConfig.environment.image}
                      alt="Room preview"
                      className="w-full h-full object-cover"
                      style={{
                        position: "relative",
                        mixBlendMode: "normal",
                        zIndex: 3,
                      }}
                    />
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
              className="flex items-center text-red-500 hover:text-red-700 mb-6 transition-all duration-300 ease-in-out"
            >
              <IoArrowBack size={16} />
              <span className="ml-1 font-light">Back</span>
            </button>
            <h2 className="text-2xl  mb-6">Your Details</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-light">Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1 font-light">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm  text-gray-700 mb-2 font-light">Email</label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1 font-light">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm  text-gray-700 mb-2 font-light">Phone Number</label>
                  <input
                    type="tel"
                    {...register("phone", { required: "Phone number is required" })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1 font-light">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm  text-gray-700 mb-2 font-light">Reference Number</label>
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
                  <label className="block text-sm font-light text-gray-700 mb-2">Tile Quantity</label>
                  <input
                    type="number"
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 1, message: "Quantity must be at least 1" }
                    })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                    min="1"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1 font-light">{errors.quantity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">Tile Size</label>
                  <select
                    {...register("tileSize", { required: "Tile size is required" })}
                    className="block w-full rounded-md border border-gray-400  shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base font-light"
                  >
                    <option value="" className="font-light font-poppins">Select size</option>
                    {tileSizes.map((size) => (
                      <option key={size.value} value={size.value} className="font-light font-poppins">
                        {size.label}
                      </option>
                    ))}
                  </select>
                  {errors.tileSize && <p className="text-red-500 text-sm mt-1 font-light">{errors.tileSize.message}</p>}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm  text-gray-700 mb-2 font-light">Message</label>
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
