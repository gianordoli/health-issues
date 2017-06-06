module.exports = {
  seasonal: {
    title: "Seasons",
    intro: "See how environmental conditions affect your health. Switch between the US and Australia to see how North and Southern hemisphere experience opposite cycles.",
    cases: [
      {
        title: "Winter",
        data: "./data/seasonal-winter.json",
        terms: ["Bronchitis", "Raynaud syndrome", "Cold"],
        geoList: ["US", "AU"],
        chartType: "seasonal",
        copy: [
          "Copy about Winter. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
      {
        title: "Spring",
        data: "./data/seasonal-spring.json",
        terms: ["Chickenpox", "Conjunctivitis", "Allergy"],
        geoList: ["US", "AU"],
        chartType: "seasonal",
        copy: [
          "Copy about Spring. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
      {
        title: "Summer",
        data: "./data/seasonal-summer.json",
        terms: ["Candidiasis", "Skin rash", "Diarrhea"],
        geoList: ["US", "AU"],
        chartType: "seasonal",
        copy: [
          "Copy about Summer. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
      // {
      //   title: "Fall",
      //   data: "./data/seasonal-fall.json",
      //   terms: [],
      //   geoList: ["US", "AU"],
      //   chartType: "seasonal",
      //   copy: [
      //     "Copy about Fall. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
      //     "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
      //   ],
      // },
    ],
  },
  holidays: {
    title: "Holidays",
    intro: "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
    cases: [
      // {
      //   title: "New Year",
      //   data: "./data/holidays-new-year.json",
      //   terms: ["Indigestion", "Headache"],
      //   geoList: ["world"],
      //   chartType: "seasonal",
      //   copy: [
      //     "Copy about New Year. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
      //     "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
      //   ],
      // },
      {
        title: "Diwali Festival",
        data: "./data/holidays-diwali-festival.json",
        terms: ["Burn", "Pain"],
        geoList: ["IN"],
        chartType: "seasonal",
        copy: [
          "Copy about Diwali Festival. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
      {
        title: "Brazilian Carnival",
        data: "./data/holidays-brazilian-carnival.json",
        terms: ["Mononucleosis"],
        geoList: ["BR"],
        chartType: "seasonal",
        copy: [
          "Copy about Brazilian Carnival. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
    ],
  },
  media: {
    title: "Media",
    intro: "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
    cases: [
      {
        title: "Campaigns",
        data: "./data/media-campaigns.json",
        terms: ["Down's syndrome", "Breast Cancer", "Autism"],
        geoList: ["world"],
        chartType: "seasonal",
        copy: [
          "Not every growth in searches are directly related with an increase in cases of a disease. Examples of that are the huge campaigns of conscientization about breast cancer, that occur during the month of October, about diabetes, that happens on November, and HIV/Aids, which international day of awareness is always celebrated on December 1st. On these dates, the interest are much higher in comparison with other periods of the year.",
        ],
      },
      {
        title: "Pop Culture",
        data: "./data/media-pop-culture.json",
        terms: ["Lupus", "Amyotrophic lateral sclerosis"],
        geoList: ["world"],
        chartType: "trend",
        copy: [
          "Celebrities also play a major role in the popularity of certain health topics. That's what happened with lupus, an inflammatory disease that affects joints, skin and kidneys. The number of searches increased when the singer Selena Gomez canceled her shows to make treatments for this illness, on October 2015 and September 2016. A similar phenomenon occurred with depression: the interest for this topic reached its peak on August 2014, when the actor Robin Williams killed himself.", "Finally, ALS, a problem in the nervous system, has passed from anonymity to trending topic during the \"ice bucket challenge\"",
        ],
      },
      {
        title: "Anti-vaccine",
        data: "./data/media-anti-vaccine.json",
        terms: ["Vaccine", "Measles"],
        geoList: ["world"],
        chartType: "trend",
        copy: [
          "The movements of parents who refuse to give vaccines for their children proclaim that immunization is a cause of autism and other maladies. Besides the fact that there are no scientific evidence to prove this accusations, the vaccines rejection is related with measles outbreaks, that happened in Ohio (2014) and California (2015). It is possible to note an increase in web searches during this periods. Health authorities blame radical groups for the sudden growth of this infectious disease in US.",
        ],
      },
    ],
  },
};
