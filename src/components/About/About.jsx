import "./About.css";
import useScrollReveal from "../../hooks/useScrollReveal";
import { Link } from "react-router-dom";

export default function About() {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section ref={ref} className="about">
      <div className={`about__container ${isVisible ? "is-visible" : ""}`}>

        <div className="about__kicker">
          <span className="about__kickerLine" />
          <span className="about__kickerText">Over ons</span>
          <span className="about__kickerLine" />
        </div>

        <h2 className="about__title">
          Het Verhaal van Salon OZ
        </h2>



        <div className="about__content">
          <p className="about__text">
            Salon OZ is geboren uit de passie en het harde werk van Tayyar Ozcan.
            Na zijn opleiding in Gent en jaren ervaring in de kapperswereld, opende
            hij in <span className="about__highlight">2020</span> zijn eerste gemengde kapsalon.
          </p>
          <p className="about__text">
            Vandaag groeit Salon OZ uit tot een volwaardig beautysalon waar stijl,
            vakmanschap en persoonlijke aandacht centraal staan. Met een team van gedreven professionals
            verwelkomen wij elke klant met één doel: <span className="about__highlight-italic">jou op je allerbest laten voelen</span>.
          </p>
        </div>

        <Link to="/about" className="about__button">
          <span className="about__buttonText">Meer over ons</span>
          <span className="about__buttonFill" />
        </Link>

      </div>
    </section>
  );
}