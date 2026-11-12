import { Smartphone, Apple, Play, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button.jsx";

const features = [
  "Exclusive app-only deals",
  "Real-time order tracking",
  "Faster checkout experience",
  "Push notifications for offers",
];

const AppDownloadSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary via-primary to-primary/80 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm font-medium">Download Our App</span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
              Shop Smarter with Our Mobile App
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-lg">
              Get the best shopping experience on your fingertips. Download now and enjoy exclusive benefits.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-background text-foreground hover:bg-background/90 h-14 px-6 rounded-xl gap-3 shadow-lg">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-[10px] opacity-70">Download on the</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </Button>
              <Button className="bg-background text-foreground hover:bg-background/90 h-14 px-6 rounded-xl gap-3 shadow-lg">
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-[10px] opacity-70">Get it on</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </Button>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Phone */}
              <div className="relative z-10 w-64 h-[500px] bg-foreground rounded-[3rem] p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-br from-secondary to-accent rounded-[2.5rem] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-2xl" />
                  <div className="h-full flex flex-col pt-10">
                    <div className="flex-1 bg-background m-1 rounded-3xl overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=800&fit=crop"
                        alt="App preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background Phone */}
              <div className="absolute top-8 -left-16 z-0 w-56 h-[440px] bg-foreground/30 rounded-[3rem] p-2 transform -rotate-12">
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded-[2.5rem]" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/30 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/30 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
