import "./About.css";
import useScrollReveal from "../../hooks/useScrollReveal";
import { Link } from "react-router-dom";

export default function About() {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section ref={ref} className="about">
      <div className={`about__container ${isVisible ? "is-visible" : ""}`}>

        <div className="about__kicker">
          {/* <span className="about__kickerLine" />
          {/* <span className="about__kickerText">Over ons</span> */}
          {/* <span className="about__kickerLine" /> */}
        </div>

        <h2 className="about__title">
          Over ons
        </h2>



        <div className="about__content">
          <p className="about__text">
            Salon OZ in Drongen is een modern en rustgevend salon waar je even kan ontsnappen aan de drukte. Een plek waar comfort, stijl en kwaliteit samenkomen in een ontspannen sfeer.
          </p>
          <p className="about__text">
            Wij ontvangen dames, heren en kinderen en zijn gespecialiseerd in snitten, kleuringen, balayages, hairextensions en verzorgende treatments. Voor heren bieden we ook professionele baardverzorging en styling, met oog voor een verzorgde en evenwichtige look.
          </p>
          <p className="about__text">
            Bij ons staat persoonlijke aandacht centraal. We luisteren naar jouw wensen en vertalen die naar een look die natuurlijk bij je past en je persoonlijkheid versterkt. Ons team werkt met passie, precisie en oog voor detail.
          </p>
          <p className="about__text">
            Je bent van harte welkom in Salon OZ, waar ons team je met warmte en oprechte gastvrijheid ontvangt.
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