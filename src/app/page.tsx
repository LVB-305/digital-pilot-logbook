import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import Navigation from "@/components/landing/navigation";
import Footer from "@/components/landing/footer";
import Features from "@/components/landing/features";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <section className="py-6 md:py-10 lg:py-20">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col space-y-4 text-center lg:text-left mx-auto lg:mx-0 max-w-[42rem]">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Track Your Flight Journey with Precision{" "}
                  {/* Added a space after "Precision" */}
                </h1>
                <p className="text-muted-foreground sm:text-xl sm:leading-8">
                  The modern digital logbook for pilots. Record flights, track
                  hours, and analyze your progress in one simple app.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-light-blue hover:bg-[#171E32] cursor-pointer"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="cursor-pointer"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-end">
                <div className="relative w-full max-w-md h-[400px] rounded-lg overflow-hidden bg-[#171E32]/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Plane
                      className="h-24 w-24 text-[#242F50] dark:text-white/80"
                      strokeWidth={1}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#242F50]/20"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Features />
      </main>
      <Footer />
    </div>
  );
}
