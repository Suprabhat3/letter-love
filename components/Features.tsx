export default function Features() {
  const features = [
    {
      icon: "✨",
      title: "Share Your Story",
      description:
        "Tell us a few details about your person, your memory, or your feelings. No writing skills needed.",
    },
    {
      icon: "🤖",
      title: "AI Magic",
      description:
        "Our AI analyzes the emotional tone and context to draft a perfectly worded letter or poem.",
    },
    {
      icon: "💌",
      title: "Customize & Share",
      description:
        "Edit the result, choose a beautiful background theme, and send it as a digital card or print it out.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold tracking-wide uppercase text-sm">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 text-foreground">
            Three Steps to <span className="text-gradient">Perfect Words</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-panel p-8 rounded-3xl hover:shadow-xl transition-all hover:-translate-y-2 group"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">
                {feature.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
