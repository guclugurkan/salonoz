import "./Hero.css";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section id="home" className="hero">
      {/* Background Video */}
      <video
        className="hero__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="https://res.cloudinary.com/dayuwiiv0/video/upload/f_auto,q_auto/v1776855958/hero3_bmbkf5.mp4" type="video/mp4" />
      </video>

      {/* Overlay vignette */}
      <div className="hero__vignette" />

      {/* Content */}
      <div className="hero__content">
        <div className="hero__accent" />

        <h1 className="hero__title">SALON OZ</h1>

        <p className="hero__subtitle">Established 2020</p>

        <p className="hero__tagline">Hair • Beauty • Barber</p>

        <div className="hero__actions">
          <Link to="/reservation" className="hero__btn hero__btn--primary">Book Online</Link>
          <Link to="/contact" className="hero__btn hero__btn--secondary">
            <Phone className="hero__icon" />
            Call us
          </Link>
        </div>
      </div>

      
    </section>
  );
}