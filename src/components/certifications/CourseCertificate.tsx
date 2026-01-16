import { useRef } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Award, Calendar, Hash, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { CourseCertificate as CertificateType } from "@/hooks/useCourseCertificates";

interface CourseCertificateProps {
  certificate: CertificateType;
  onShare?: () => void;
}

const CourseCertificate = ({ certificate, onShare }: CourseCertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      toast.loading("Generating PDF...");
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`VAULT-Certificate-${certificate.certificate_number}.pdf`);
      
      toast.dismiss();
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download certificate");
      console.error(error);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    
    try {
      toast.loading("Generating image...");
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = `VAULT-Certificate-${certificate.certificate_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.dismiss();
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download certificate");
      console.error(error);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify-course-certificate?cert=${certificate.certificate_number}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "VAULT™ Course Certificate",
          text: `I completed ${certificate.course_title} at VAULT™ Baseball!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed, copy to clipboard instead
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    }
    
    onShare?.();
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <motion.div
        ref={certificateRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/30 rounded-xl p-8 md:p-12 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary))_0%,transparent_50%)]" />
        </div>
        
        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/40" />
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/40" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/40" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/40" />
        
        {/* Content */}
        <div className="relative text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Award className="w-8 h-8 text-primary" />
              <span className="text-sm font-semibold tracking-[0.3em] text-primary uppercase">
                Certificate of Completion
              </span>
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-wider text-foreground">
              VAULT™ BASEBALL
            </h1>
          </div>
          
          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/50" />
            <CheckCircle className="w-6 h-6 text-primary" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          
          {/* Recipient */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              This is to certify that
            </p>
            <h2 className="font-bebas text-3xl md:text-4xl text-foreground">
              {certificate.recipient_name}
            </h2>
          </div>
          
          {/* Course */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Has successfully completed
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-primary">
              {certificate.course_title}
            </h3>
          </div>
          
          {/* Date & Certificate Number */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Completed: {format(new Date(certificate.completion_date), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="w-4 h-4" />
              <span className="font-mono">{certificate.certificate_number}</span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Verify this certificate at vault-baseball.lovable.app/verify-course-certificate
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Action Buttons */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadImage} className="gap-2">
              <Download className="w-4 h-4" />
              Download Image
            </Button>
            <Button variant="secondary" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCertificate;
