import { CheckCircle, Clock, Shield } from "lucide-react";

export default function Features() {
  return (
    <section
      id="features"
      className="py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-secondary/30"
    >
      <div className="container mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
          Features
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Everything you need to track your flight hours and progress
        </p>
      </div>
      <div className="container mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-8 mt-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="relative overflow-hidden rounded-lg border bg-background p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#171E32] text-white">
              {feature.icon}
            </div>
            <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const features = [
  {
    title: "Digital Flight Logs",
    description: "Record all your flight details digitally with cloud storage.",
    icon: <CheckCircle className="h-6 w-6" />,
  },
  {
    title: "Totals",
    description:
      "Automatically calculate and track your flight hours, including night, IFR, and PIC time.",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: "Secure Storage",
    description:
      "Your flight data is securely stored and backed up in the cloud. Want to host it yourself? You can!",
    icon: <Shield className="h-6 w-6" />,
  },
];
