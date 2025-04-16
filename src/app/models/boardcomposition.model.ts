export interface DemographicBreakdown {
    percent: number;
    count: number;
  }
  
  export interface BoardMembersBreakdown {
    totalboardmembers: number;
    black: DemographicBreakdown;
    white: DemographicBreakdown;
    indian: DemographicBreakdown;
    asian: DemographicBreakdown;
    coloured: DemographicBreakdown;
    below30: DemographicBreakdown;
    between30And50: DemographicBreakdown;
    over50: DemographicBreakdown;
    female: DemographicBreakdown;
    male: DemographicBreakdown;
    boardprofile: string;
  }