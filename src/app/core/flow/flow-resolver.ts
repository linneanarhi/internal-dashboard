import { Customer } from '../../data/customers.data';
import { Quote } from '../../data/quotes.data';

type FlowState = {
  statusLabel: string;
  nextAction: string;
  isActive: boolean;
  canApproveQuote: boolean;
  canActivateAgreement: boolean;
};

export function resolveCustomerFlowState(args: {
  customer?: Customer;
  currentQuote?: Quote;
  agreementStatus?: 'PENDING_SETUP' | 'ACTIVE' | string;
  setupStatus?: 'INCOMPLETE' | 'COMPLETE' | string;
}): FlowState {
  const { customer, currentQuote, agreementStatus, setupStatus } = args;

  if (!customer) {
    return {
      statusLabel: '—',
      nextAction: '—',
      isActive: false,
      canApproveQuote: false,
      canActivateAgreement: false,
    };
  }

  const quoteStatus = currentQuote?.status;
  const agreementActive = agreementStatus === 'ACTIVE';
  const setupComplete = setupStatus === 'COMPLETE';

  const isActive = agreementActive && setupComplete;

  const canApproveQuote = !!currentQuote && (quoteStatus === 'DRAFT' || quoteStatus === 'SENT');
  const canActivateAgreement = quoteStatus === 'APPROVED' && !isActive;

  if (isActive) {
    return {
      statusLabel: 'Klar',
      nextAction: 'Inget – kunden är aktiv',
      isActive,
      canApproveQuote,
      canActivateAgreement,
    };
  }

  if (!currentQuote) {
    return {
      statusLabel: 'Ny kund',
      nextAction: 'Skapa offert',
      isActive,
      canApproveQuote,
      canActivateAgreement,
    };
  }

  if (quoteStatus === 'DRAFT') {
    return {
      statusLabel: 'Offert: Utkast',
      nextAction: 'Skicka offert',
      isActive,
      canApproveQuote,
      canActivateAgreement,
    };
  }

  if (quoteStatus === 'SENT') {
    return {
      statusLabel: 'Offert: Skickad',
      nextAction: 'Vänta på godkännande / Godkänn manuellt',
      isActive,
      canApproveQuote,
      canActivateAgreement,
    };
  }

  if (quoteStatus === 'APPROVED') {
    return {
      statusLabel: 'Offert: Godkänd',
      nextAction: setupComplete ? 'Aktivera avtal' : 'Teknisk uppsättning',
      isActive,
      canApproveQuote,
      canActivateAgreement,
    };
  }

  if (quoteStatus === 'REJECTED') {
    return {
      statusLabel: 'Offert: Avslagen',
      nextAction: 'Skapa ny offert',
      isActive,
      canApproveQuote,
      canActivateAgreement,
    };
  }

  if (quoteStatus === 'CONVERTED') {
    return {
      statusLabel: 'Konverterad',
      nextAction: setupComplete ? 'Aktivera avtal' : 'Teknisk uppsättning',
      isActive,
      canApproveQuote,
      canActivateAgreement,
    };
  }

  return {
    statusLabel: 'Pågående',
    nextAction: 'Fortsätt i flödet',
    isActive,
    canApproveQuote,
    canActivateAgreement,
  };
}
