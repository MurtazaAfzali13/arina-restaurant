"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <span className="font-bold text-2xl bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 text-transparent">
                Ariana Feast
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Experience Afghan hospitality and flavors where tradition meets taste.
              Serving love and culture in every bite.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="rounded-full p-2 bg-gray-800 hover:bg-green-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="rounded-full p-2 bg-gray-800 hover:bg-green-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="rounded-full p-2 bg-gray-800 hover:bg-green-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="rounded-full p-2 bg-gray-800 hover:bg-green-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/" className="hover:text-green-500 transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-green-500 transition-colors">Menu</Link></li>
              <li><Link href="/about" className="hover:text-green-500 transition-colors">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-green-500 transition-colors">Gallery</Link></li>
              <li><Link href="/blog" className="hover:text-green-500 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-green-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/reservation" className="hover:text-green-500 transition-colors">Table Reservations</Link></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Private Events</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Catering Services</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Corporate Events</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Chef’s Table</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Wine Pairing</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mr-3 mt-1" />
                <div>
                  <p>123 Ariana Street</p>
                  <p>Kabul City, Afghanistan</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
                <p>(+93) 700-123-456</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
                <p>hello@arianafeast.com</p>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-green-500 flex-shrink-0 mr-3 mt-1" />
                <div>
                  <p>Mon - Thu: 11:00 AM - 10:00 PM</p>
                  <p>Fri - Sat: 11:00 AM - 11:00 PM</p>
                  <p>Sun: 10:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Ariana Feast — Authentic Afghan Restaurant. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-green-500 transition-colors text-gray-400 text-sm">Privacy Policy</a>
              <a href="#" className="hover:text-green-500 transition-colors text-gray-400 text-sm">Terms of Service</a>
              <a href="#" className="hover:text-green-500 transition-colors text-gray-400 text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
