"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Facebook, Twitter, Linkedin } from "lucide-react";

interface TeamMember {
  name: string;
  image: string;
  bio: string;
  socials?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: "John Doggett",
    image: "/images/ourthem/staff-01.jpg",
    bio: "Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.",
    socials: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    name: "Jeffrey Spender",
    image: "/images/ourthem/staff-02.jpg",
    bio: "Donec sodales sagittis magna. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus.",
    socials: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    name: "Monica Reyes",
    image: "/images/ourthem/staff-03.jpg",
    bio: "Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis.",
    socials: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
];

const OurTeam: React.FC = () => {
  return (
    <section
      id="our_team"
      className="relative py-24 bg-fixed bg-center bg-cover bg-[url('/images/background/image1.jpg')]"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative container mx-auto px-6 text-center text-white">
        {/* عنوان و توضیحات */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Our Team</h2>
          <p className="max-w-3xl mx-auto text-gray-200 mb-16">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form.
          </p>
        </motion.div>

        {/* اعضای تیم */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative w-full h-64 rounded-xl overflow-hidden mb-5">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
              <p className="text-gray-300 text-sm mb-4">{member.bio}</p>

              <div className="flex justify-center space-x-4">
                {member.socials?.facebook && (
                  <a href={member.socials.facebook} className="hover:text-blue-500">
                    <Facebook size={20} />
                  </a>
                )}
                {member.socials?.twitter && (
                  <a href={member.socials.twitter} className="hover:text-sky-400">
                    <Twitter size={20} />
                  </a>
                )}
                {member.socials?.linkedin && (
                  <a href={member.socials.linkedin} className="hover:text-blue-600">
                    <Linkedin size={20} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
