import { Mail, Gift, Bell } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";

const NewsletterSection = () => {
  return (
    <section className="py-16 gradient-hero relative overflow-hidden bg-background">
      <div className="container mx-auto relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Subscribe & Get <span className="text-gradient-primary">20% Off</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Join our newsletter and be the first to know about exclusive deals, new arrivals, and special offers.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <Input
              type="email"
              placeholder="Enter your email"
              className="rounded-full bg-background border-border"
            />
            <Button className="gradient-primary text-primary-foreground rounded-full px-8 shrink-0">
              Subscribe
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <span>Exclusive offers</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Early access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
