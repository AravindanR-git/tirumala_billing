// src/pages/Splash.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      navigate("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 text-black"
          style={{
            width: "100vw",
            height: "100vh",
            textAlign: "center",
            backgroundImage: "url('/images/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col items-center justify-center text-center">
            {/* Truck Icon */}
            <motion.div
              className="p-6 rounded-full bg-white/30 shadow-xl backdrop-blur-md flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
            >
             <img
            src="/images/splash-logo.png"
  alt="Truck Icon"
  style={{
    width: "50vh",      // set the exact width you want
    height: "50vw",     // set the exact height you want
    objectFit: "contain" // preserves aspect ratio
  }}
/>
            </motion.div>

            {/* App Title with semi-transparent white background */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-6 px-6 py-3 bg-white/50 rounded-lg inline-block shadow-md"
            >
              <h1 className="text-3xl md:text-5xl font-extrabold">
                Tirumala Blue Metals
              </h1>
            </motion.div>

            {/* Spinner */}
            <motion.div
              className="mt-8 w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
