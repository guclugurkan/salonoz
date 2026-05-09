import React from 'react';
import PageTransition from '../../components/PageTransition/PageTransition';
import './TermsPage.css';

const TermsPage = () => {
  return (
    <PageTransition>
      <div className="terms-page">
        <div className="terms-header">
          <h1>Algemene Voorwaarden</h1>
          <p>Annulatie- en Boekingsvoorwaarden</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>Annuleren of wijzigen van een afspraak</h2>
            <p>Een afspraak annuleren of verplaatsen kan kosteloos tot 24 uur vóór de geplande afspraak.</p>
            <p>Voor grotere of tijdsintensieve behandelingen vragen wij om wijzigingen of annulaties minstens 48 uur op voorhand door te geven.</p>
            <p>Annulaties of wijzigingen kunnen telefonisch gemeld worden via <strong>0485 55 02 71</strong>.</p>
          </section>

          <hr className="terms-divider" />

          <section className="terms-section">
            <h2>Niet opdagen of vergeten afspraak</h2>
            <p>Wanneer u zonder voorafgaande verwittiging niet aanwezig bent op uw afspraak, zijn wij genoodzaakt het volledige bedrag van de geboekte behandeling aan te rekenen.</p>
            <p>Wij reserveren immers specifiek tijd voor uw afspraak en kunnen hierdoor andere klanten niet inplannen.</p>
          </section>

          <hr className="terms-divider" />

          <section className="terms-section">
            <h2>Te laat op uw afspraak</h2>
            <p>Indien u te laat arriveert, bekijken wij of de behandeling nog binnen het gereserveerde tijdsblok kan worden uitgevoerd.</p>
            <ul className="terms-list">
              <li>Indien dit mogelijk is, gaat de behandeling gewoon door.</li>
              <li>Indien dit niet meer haalbaar is, kan de afspraak helaas niet doorgaan en wordt het volledige bedrag van de behandeling aangerekend.</li>
            </ul>
          </section>

          <hr className="terms-divider" />

          <section className="terms-section">
            <h2>Tarieven & Prijsinformatie</h2>
            <p>Benieuwd naar de prijs van een behandeling bij Salon Oz?</p>
            <p>Onze prijzen zijn richtprijzen vanaf en kunnen variëren afhankelijk van de gekozen techniek, de haarlengte, haardikte en het benodigde productverbruik.</p>
            <p>Wenst u vooraf een exacte prijsinschatting? Neem gerust contact met ons op via sociale media, telefonisch of kom vrijblijvend langs voor een gratis consultatie. We adviseren u graag over de juiste techniek en bezorgen u een correcte prijsindicatie.</p>
          </section>

          <hr className="terms-divider" />

          <section className="terms-section">
            <h2>Kleuringen & technische behandelingen</h2>
            <p>Behandelingen zoals balayage, ombre, sombre en babylights zijn maatwerk. De uiteindelijke prijs is afhankelijk van verschillende factoren, waaronder:</p>
            <ul className="terms-list">
              <li>haarlengte en haardikte</li>
              <li>hoeveelheid product die nodig is</li>
              <li>eventuele extra toners of nabehandelingen</li>
              <li>gewenste oplichting en eindresultaat</li>
            </ul>
            <p>Kleurproducten worden steeds nauwkeurig afgewogen en aangerekend op basis van het effectief gebruikte product. Bij langer, dikker haar of een grotere uitgroei kan daarom een supplement aangerekend worden.</p>
            <p>Eventuele meerkosten kunnen enkel tijdens de behandeling zelf correct bepaald worden en kunnen niet vooraf exact worden vastgelegd.</p>
          </section>

          <hr className="terms-divider" />

          <section className="terms-section">
            <h2>Inbegrepen in de prijs</h2>
            <p>Volgende zaken zijn steeds inbegrepen:</p>
            <ul className="terms-list">
              <li>wassen</li>
              <li>standaard verzorging</li>
              <li>stylingproducten</li>
              <li>basisafwerking/styling</li>
            </ul>
            <p>Extra verzorgingen of bijkomende stylingdiensten worden afzonderlijk aangerekend.</p>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default TermsPage;
