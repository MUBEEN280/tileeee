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
    { value: "12x12", label: "12\" x 12\"" },
    { value: "16x16", label: "16\" x 16\"" },
    { value: "18x18", label: "18\" x 18\"" },
    { value: "24x24", label: "24\" x 24\"" },
    { value: "custom", label: "Custom Size" }
  ];

  const generatePDF = async (formData) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      // Add header with logo
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Tile Configuration Details", pageWidth / 2, margin + 10, { align: "center" });
      
      // Add a decorative line
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, margin + 15, pageWidth - margin, margin + 15);
      
      let yPosition = margin + 25;
      
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
        pdf.setTextColor(0, 0, 0);
        pdf.text("Thank You!", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setTextColor(51, 51, 51);
        const thankYouMessage = "Thank you for shopping with us! We appreciate your business and hope you love your new tile selection. If you have any questions or need assistance, please don't hesitate to contact us.";
        const splitMessage = pdf.splitTextToSize(thankYouMessage, pageWidth - (margin * 2));
        pdf.text(splitMessage, pageWidth / 2, yPosition, { align: "center" });
        yPosition += splitMessage.length * 8 + 10;

        // Add contact information
        pdf.setFontSize(10);
        pdf.text("Contact Us:", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
        pdf.text("Email: support@tilesimulator.com", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
        pdf.text("Phone: (555) 123-4567", pageWidth / 2, yPosition, { align: "center" });
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
      <div className="bg-white p-8 rounded-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        {!isFormOpen ? (
          // Preview Screen
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tile Preview</h2>
              <button
                onClick={() => onClose()}
                className="bg-black bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90 transition"
              >
                <IoMdClose size={24} />
              </button>
            </div>
            <div ref={previewRef} className="space-y-6">
              {/* Tile Pattern Without Environment */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-4">Tile Pattern</h3>
                <div 
                  className="w-full rounded-lg overflow-hidden relative"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "auto",
                    minHeight: "300px",
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
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-4">Tile in Environment</h3>
                  <div 
                    className="w-full rounded-lg overflow-hidden relative"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      height: "auto",
                      minHeight: "300px",
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

              {/* Configuration Details */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold mb-2">Selected Configuration:</h3>
                <p>Tile Name: {tileConfig?.tile?.name || 'N/A'}</p>
                <p>Tile Size: {tileConfig?.size}</p>
                <p>Color: {tileConfig?.color}</p>
                <p>Grout Color: {tileConfig?.groutColor}</p>
                <p>Grout Thickness: {tileConfig?.thickness}</p>
                {tileConfig?.environment && (
                  <p>Environment: {tileConfig.environment.label}</p>
                )}
              </div>
            </div>

            <button
              className="mt-6 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 text-base font-medium w-full"
              onClick={() => setIsFormOpen(true)}
            >
              Send Yourself a Copy!
            </button>
          </div>
        ) : (
          // Form Screen
          <div>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
            >
              <IoArrowBack size={20} />
              <span className="ml-1">Back</span>
            </button>
            <h2 className="text-2xl font-bold mb-6">Your Details</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    {...register("name", { required: "Name is required" })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    {...register("phone", { required: "Phone number is required" })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                  <input 
                    type="text" 
                    {...register("reference")}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Tile Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tile Quantity</label>
                  <input 
                    type="number" 
                    {...register("quantity", { 
                      required: "Quantity is required",
                      min: { value: 1, message: "Quantity must be at least 1" }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base"
                    min="1"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tile Size</label>
                  <select 
                    {...register("tileSize", { required: "Tile size is required" })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base"
                  >
                    <option value="">Select size</option>
                    {tileSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                  {errors.tileSize && <p className="text-red-500 text-sm mt-1">{errors.tileSize.message}</p>}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  {...register("message")}
                  rows="4"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black px-4 py-3 text-base"
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
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 text-base font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-base font-medium"
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
