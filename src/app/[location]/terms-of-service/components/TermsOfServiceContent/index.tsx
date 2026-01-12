"use client";

import React from "react";
import { TERMS_OF_SERVICE_CONTENT } from "../../constants/termsOfServiceContent";

export function TermsOfServiceContent() {
  const { introduction, accountTerms, paymentAndRefundsTerms, cancellationAndTermination, modificationsToServiceAndPrices, copyrightAndContentOwnership, generalConditions } = TERMS_OF_SERVICE_CONTENT;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Introduction */}
      <div className="space-y-4">
        <p className="text-base leading-relaxed text-foreground">
          {introduction.paragraph1}
        </p>
        <p className="text-base leading-relaxed text-foreground">
          {introduction.paragraph2}
        </p>
        <p className="text-base leading-relaxed text-foreground">
          {introduction.paragraph3}
        </p>
      </div>

      {/* Account Terms */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {accountTerms.title}
        </h2>
        <ol className="list-decimal list-outside space-y-3 ml-6 text-base leading-relaxed text-foreground">
          {accountTerms.items.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ol>
      </section>

      {/* Payment and Refunds Terms */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {paymentAndRefundsTerms.title}
        </h2>
        <ol className="list-decimal list-outside space-y-3 ml-6 text-base leading-relaxed text-foreground">
          {paymentAndRefundsTerms.items.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ol>
      </section>

      {/* Cancellation and Termination */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {cancellationAndTermination.title}
        </h2>
        <ol className="list-decimal list-outside space-y-3 ml-6 text-base leading-relaxed text-foreground">
          {cancellationAndTermination.items.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ol>
      </section>

      {/* Modifications to the Service and Prices */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {modificationsToServiceAndPrices.title}
        </h2>
        <p className="text-base leading-relaxed text-foreground">
          {modificationsToServiceAndPrices.content}
        </p>
      </section>

      {/* Copyright and Content Ownership */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {copyrightAndContentOwnership.title}
        </h2>
        <ol className="list-decimal list-outside space-y-3 ml-6 text-base leading-relaxed text-foreground">
          {copyrightAndContentOwnership.items.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ol>
      </section>

      {/* General Conditions */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          {generalConditions.title}
        </h2>
        <ol className="list-decimal list-outside space-y-3 ml-6 text-base leading-relaxed text-foreground">
          {generalConditions.items.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
