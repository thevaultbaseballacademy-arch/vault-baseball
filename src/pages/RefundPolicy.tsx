import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

const RefundPolicy = () => {
  const lastUpdated = "January 16, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="font-bebas text-4xl md:text-5xl tracking-wide mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
        
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-auto">
              <div className="prose prose-invert max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At VAULT™ Baseball Academy, we want you to be completely satisfied with your purchase. This Refund Policy 
                    outlines the terms and conditions for refunds on our digital products, courses, subscriptions, and services.
                  </p>
                </section>

                {/* Refund Eligibility Summary */}
                <section className="grid gap-4 md:grid-cols-2">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-green-400">Eligible for Refund</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Request within 14 days of purchase</li>
                      <li>• Less than 25% course completion</li>
                      <li>• Technical issues preventing access</li>
                      <li>• Duplicate or erroneous charges</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold text-red-400">Not Eligible for Refund</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• More than 25% course completion</li>
                      <li>• Certificate already issued</li>
                      <li>• Request after 14 days</li>
                      <li>• Violation of Terms of Service</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Course and Program Purchases</h2>
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">14-Day Money-Back Guarantee</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We offer a 14-day money-back guarantee on all course and program purchases. If you are not satisfied with 
                    your purchase, you may request a full refund within 14 days of the purchase date, provided you have completed 
                    less than 25% of the course content and have not received a certificate of completion.
                  </p>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Conditions</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Refund requests must be submitted within 14 days of purchase</li>
                    <li>Course completion must be less than 25% at the time of request</li>
                    <li>No certificate of completion has been issued</li>
                    <li>The refund will be issued to the original payment method</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Subscription Services</h2>
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Monthly Subscriptions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Monthly subscriptions can be canceled at any time. Upon cancellation, you will retain access until the end of 
                    your current billing period. We do not provide pro-rated refunds for unused portions of the monthly billing period.
                  </p>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Annual Subscriptions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Annual subscriptions may be eligible for a pro-rated refund if canceled within the first 30 days. After 30 days, 
                    no refunds will be issued, but you will retain access until the end of your subscription term.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Certification Exam Fees</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Certification exam fees are generally non-refundable once the exam has been started or a passing score achieved. 
                    However, if you experience technical difficulties that prevent you from completing the exam, please contact our 
                    support team within 24 hours for assistance.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. One-Time Products and Services</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    One-time purchases such as coaching sessions, audits, or consultations are refundable if canceled at least 
                    48 hours before the scheduled service. No refunds will be provided for cancellations within 48 hours or 
                    for no-shows.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Technical Issues</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you experience persistent technical issues that prevent you from accessing purchased content, and our 
                    support team is unable to resolve the issue, you may be eligible for a full refund regardless of the time 
                    elapsed since purchase.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. How to Request a Refund</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    To request a refund, please follow these steps:
                  </p>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                    <li>Email our support team at <strong className="text-foreground">support@vaultbaseball.com</strong></li>
                    <li>Include your account email and order/transaction ID</li>
                    <li>Provide the reason for your refund request</li>
                    <li>Allow 3-5 business days for our team to review your request</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Refund Processing</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Once approved, refunds will be processed within 5-10 business days. The refund will be issued to the original 
                    payment method. Depending on your bank or credit card company, it may take an additional 5-10 business days 
                    for the refund to appear on your statement.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Exceptions</h2>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-amber-400 mb-2">Important Exceptions</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Promotional or discounted purchases may have different refund terms</li>
                          <li>• Bundle purchases are refunded as a whole, not individual components</li>
                          <li>• Refunds may be denied if Terms of Service violations occurred</li>
                          <li>• Repeated refund requests may result in account review</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Chargebacks</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We encourage you to contact our support team before initiating a chargeback with your bank or credit card 
                    company. Chargebacks may result in immediate account suspension and additional fees. We reserve the right 
                    to dispute illegitimate chargebacks.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Refund Policy, please contact us at:<br />
                    <strong className="text-foreground">VAULT™ Baseball Academy</strong><br />
                    Email: support@vaultbaseball.com
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
