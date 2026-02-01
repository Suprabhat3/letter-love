"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Star, Quote, Heart, Mail, Pin } from "lucide-react";
import { HeartIcon } from "./HeartIcon";

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Married 5 Years",
    content:
      "Bas feelings thi, par words nahi mil rahe the. LetterLove ne meri tooti-footi baaton ko ek beautiful vow mein badal diya. Sab emotional ho gaye!",
    location: "Mumbai, India",
    stampColor: "bg-rose-400",
  },
  {
    name: "Rahul Verma",
    role: "Anniversary Surprise",
    content:
      "10th Anniversary ke liye poem likhi. Wife ne frame karwa li! Best gift diya hai saalon mein. Bilkul wahi likha jo main feel kar raha tha.",
    location: "Delhi, India",
    stampColor: "bg-purple-400",
  },
  {
    name: "Priya Singh",
    role: "Long Distance",
    content:
      "Long distance mein jab bohot yaad aati thi, isne help kiya. Video call se pehle ek letter bheja, uska din ban gaya. Best feeling ever.",
    location: "Bangalore, India",
    stampColor: "bg-orange-400",
  },
  {
    name: "Arjun Malhotra",
    role: "Proposal",
    content:
      "Propose karna tha par darr lag raha tha ki start kaise karoon. Isne mujhe perfect lines di. Aur haan... She said Yes! ❤️",
    location: "Pune, India",
    stampColor: "bg-blue-400",
  },
  {
    name: "Sneha Gupta",
    role: "Just Because",
    content:
      "Kabhi kabhi bas 'I Love You' bolna kaafi nahi hota. Har hafte kuch naya aur romantic bhejne ka tareeka mil gaya hai mujhe.",
    location: "Jaipur, India",
    stampColor: "bg-emerald-400",
  },
  {
    name: "Vikram Kapoor",
    role: "Apology",
    content:
      "Galti meri thi, sorry bolna tha par dhang se. LetterLove ne mere emotions ko sahi words diye taaki main use mana sakoon.",
    location: "Chandigarh, India",
    stampColor: "bg-indigo-400",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 bg-rose-50 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vintage Paper Texture Overlay (Concept) */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-100/60 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/60 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 text-sm font-medium mb-6 shadow-sm"
          >
            <HeartIcon className=" text-pink-400" />
            <span className="font-handwriting text-pink-400">Wall of Love</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif text-stone-800 mb-6"
          >
            Letters from the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 font-handwriting px-2 pb-2 inline-block">
              Heart
            </span>
          </motion.h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Real stories from people who found the right words at the right
            time.
          </p>
        </div>

        {/* Mobile: Horizontal scroll | Desktop: Grid */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-6 snap-x snap-mandatory pb-8 pt-4 scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
          {testimonials.map((testimonial, index) => (
            <Postcard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Postcard({ testimonial, index }: { testimonial: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "bg-[#fffdf9] flex-shrink-0 w-[85vw] md:w-full snap-center relative p-6 md:p-8 shadow-[1px_1px_2px_rgba(0,0,0,0.05),0_8px_16px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] transition-all duration-300 group border border-stone-200/60 h-full flex flex-col justify-between rounded-sm",
        // Pinned rotation effect
        index % 2 === 0 ? "rotate-1" : "-rotate-1",
        "hover:rotate-0 hover:scale-[1.02] transform origin-top",
      )}
    >
      {/* Pin Visual */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 rounded-full blur-[2px] scale-75 translate-y-2" />
        <Pin className="w-8 h-8 text-rose-500 fill-rose-500 drop-shadow-sm transform -rotate-45" />
      </div>

      {/* Postcard visual elements */}
      <div className="absolute top-6 right-6 flex flex-col items-center gap-2">
        <div
          className={cn(
            "w-12 h-14 rounded shadow-inner flex items-center justify-center relative overflow-hidden",
            testimonial.stampColor,
          )}
        >
          <div className="absolute inset-0 border-[3px] border-white/30 border-dashed m-1 rounded-sm" />
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        {/* Fake stamp lines */}
        <div className="w-16 h-8 bg-[url('/stamp-lines.svg')] opacity-20 -rotate-12" />
      </div>

      <div className="mb-8 pr-16">
        <div className="h-10 w-10 bg-stone-100 rounded-full flex items-center justify-center font-bold text-stone-400 mb-3 text-lg font-serif">
          {testimonial.name[0]}
        </div>
        <h4 className="font-serif font-bold text-lg text-stone-800 leading-none">
          {testimonial.name}
        </h4>
        <div className="text-xs font-bold uppercase tracking-wider text-pink-500 mt-1">
          {testimonial.role}
        </div>
      </div>

      <div className="space-y-4">
        <Quote className="w-6 h-6 text-stone-300" />
        <p className="text-lg font-handwriting text-stone-600 leading-relaxed">
          {testimonial.content}
        </p>
        <div className="pt-4 border-t border-dashed border-stone-200 flex justify-between items-center">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Sent From
          </span>
          <span className="text-sm font-serif italic text-stone-500">
            {testimonial.location}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
