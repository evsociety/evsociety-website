export type PartnerType = 'company' | 'institute' | 'researcher';

export interface Partner {
  id: string;
  slug: string;
  type: PartnerType;
  name: string;
  shortDescription: string;
  about: string;
  logo: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  domains: string[];
  tags: string[];
  links: {
    website?: string;
    linkedin?: string;
  };
}

export interface EVEvent {
  id: string;
  title: string;
  date: string;
  mode: 'Online' | 'In-person' | 'Hybrid';
  city: string;
  summary: string;
  registrationUrl: string;
  tags: string[];
  time?: string;
  speaker?: string;
  speakerTitle?: string;
  speakerOrganization?: string;
  posterLinkURL?: string;
  youtubeURL?: string;
  presentationURL?: string;
  reference?: {
    docName: string;
    docURL: string;
    Source: string;
  }[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'Guideline' | 'Whitepaper' | 'Toolkit';
  summary: string;
  url: string;
  tags: string[];
}
