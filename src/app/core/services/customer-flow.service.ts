import { Injectable } from '@angular/core';
import {
  Agreement,
  Customer,
  Quote,
  TechnicalSetup,
} from '../models/flow.models';

export type CustomerFlow = {
  statusLabel: string;
  nextAction: string;
  isActive: boolean;

  canApproveQuote: boolean;
  canActivateAgreement: boolean;
  canCompleteSetup: boolean;

  // vilka actions UI ska visa
  actions: {
    sendQuote: boolean;
    approveQuote: boolean;
    goActivateAgreement: boolean;
    goTechnicalSetup: boolean;
    addProduct: boolean;
  };
};

@Injectable({ providedIn: 'root' })
export class CustomerFlowService {
  resolve(params: {
    customer: Customer;
    currentQuote?: Quote;
    currentAgreement?: Agreement;
    setup?: TechnicalSetup;
  }): CustomerFlow {
    const { customer, currentQuote, currentAgreement, setup } = params;

    // Default (NEW kund utan något)
    let statusLabel = 'Ny kund';
    let nextAction = 'Skapa offert';
    let isActive = customer.status === 'ACTIVE';

    const quoteStatus = currentQuote?.status;
    const agreementStatus = currentAgreement?.status;
    const setupStatus = setup?.status;

    // Bas-actions
    const actions = {
      sendQuote: false,
      approveQuote: false,
      goActivateAgreement: false,
      goTechnicalSetup: true, // alltid ok att titta
      addProduct: customer.status === 'ACTIVE', // add product bara när aktiv kund
    };

    // 1) Offertflöde
    if (quoteStatus === 'DRAFT') {
      statusLabel = 'Offert: Utkast';
      nextAction = 'Skicka offert';
      actions.sendQuote = true;
    }

    if (quoteStatus === 'SENT') {
      statusLabel = 'Offert: Skickad';
      nextAction = 'Invänta godkännande';
      actions.approveQuote = true; // i mock: admin kan klicka “godkänn”
    }

    if (quoteStatus === 'APPROVED') {
      statusLabel = 'Offert: Godkänd';
      nextAction = 'Aktivera avtal';
      actions.goActivateAgreement = true;
    }

    // 2) Avtal + setup
    if (agreementStatus === 'PENDING_SETUP') {
      statusLabel = 'Avtal: Väntar på setup';
      nextAction = 'Teknisk uppsättning';
      actions.goTechnicalSetup = true;
      actions.goActivateAgreement = true; // aktivera-formen
    }

    if (setupStatus === 'COMPLETE' && agreementStatus === 'PENDING_SETUP') {
      statusLabel = 'Setup: Klar';
      nextAction = 'Sätt avtal aktivt';
    }

    if (agreementStatus === 'ACTIVE') {
      statusLabel = 'Avtal: Aktivt';
      nextAction = 'Kund aktiv';
      isActive = true;
      actions.goActivateAgreement = false;
      actions.sendQuote = false;
      actions.approveQuote = false;
      actions.addProduct = true;
    }

    // booleans som dina tabs redan använder :contentReference[oaicite:5]{index=5} :contentReference[oaicite:6]{index=6}
    const canApproveQuote = actions.approveQuote;
    const canActivateAgreement = actions.goActivateAgreement;
    const canCompleteSetup = setupStatus !== 'COMPLETE' && agreementStatus === 'PENDING_SETUP';

    return {
      statusLabel,
      nextAction,
      isActive,
      canApproveQuote,
      canActivateAgreement,
      canCompleteSetup,
      actions,
    };
  }
}
