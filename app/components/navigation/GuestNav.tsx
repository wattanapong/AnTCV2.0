import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function GuestNav() {
  return ( 
    <nav className="bg-white bg-opacity-90 shadow-md py-4 px-6 top-0 left-0 right-0 z-50 drop-shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
      <Link href={"/"}>
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/LOGO.png"
            alt="AnTCV Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="font-bold text-2xl text-blue-700">AnTCV</span>
        </motion.div>
      </Link>

      <div className="space-x-4">
        <Link href={"/sign-in"}>
          <motion.button 
            className="font-semibold px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </Link>
        <Link href={"/sign-up"}>
          <motion.button 
            className="font-semibold px-6 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
        </Link>
      </div>
      </div>
    </nav>
  );
}