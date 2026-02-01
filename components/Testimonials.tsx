export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Said 'Yes'",
      content:
        "I'm terrible with words, but LetterLove helped me write my vows. There wasn't a dry eye in the house.",
      avatar: "S",
    },
    {
      name: "James L.",
      role: "Anniversary",
      content:
        "Drafted a poem for our 10th anniversary. My wife framed it. Best gift I've given her in years.",
      avatar: "J",
    },
    {
      name: "Emily R.",
      role: "Long Distance",
      content:
        "Helped me express how much I missed him when we were apart. It bridged the distance perfectly.",
      avatar: "E",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 md:py-32 bg-secondary/30 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold tracking-wide uppercase text-sm">
            Wall of Love
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 text-foreground">
            Stories from the{" "}
            <span className="text-gradient font-handwriting pr-2">Heart</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-sm border border-pink-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-foreground/50">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-foreground/80 italic leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Ready to write your own?</h3>
          <button className="btn-primary px-8 py-3 rounded-full font-semibold">
            Start Writing Now
          </button>
        </div>
      </div>
    </section>
  );
}
