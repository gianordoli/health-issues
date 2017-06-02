module.exports = {
  seasonal: {
    title: "Seasonal",
    intro: "See how environmental conditions affect your health. Switch between the US and Australia to see how North and Southern hemisphere experience opposite cycles.",
    cases: {
      winter: {
        label: "Winter",
        data: "./data/seasonal-winter.json",
        terms: ["Cough", "Common cold", "High Blood Pressure"],
        geoList: ["US", "AU"],
        chartType: "seasonal",
        copy: ["Celebrities also play a major role in the popularity of certain health topics. That's what happened with lupus, an inflammatory disease that affects joints, skin and kidneys. The number of searches increased when the singer Selena Gomez canceled her shows to make treatments for this illness, on October 2015 and September 2016. A similar phenomenon occurred with depression: the interest for this topic reached its peak on August 2014, when the actor Robin Williams killed himself. Finally, ALS, a problem in the nervous system, has passed from anonymity to trending topic during the \"ice bucket challenge\", a series of home-made videos in which people threw themselves a container full of cold water to raise knowledge and collect funds for scientific research."],
      },
      spring: {

      },
      summer: {

      },
      fall: {

      },
    },
  },
  // holidays: {
  //   title: "Holidays",
  //   intro: "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
  //   cases: {
  //     newYear: {
  //       label: "New Year",
  //       termNames: ["Indigestion", "Headache"],
  //       geoIsos: ["World"],
  //       chartType: ["seasonal"],
  //       body: "Celebrities also play a major role in the popularity of certain health topics. That's what happened with lupus, an inflammatory disease that affects joints, skin and kidneys. The number of searches increased when the singer Selena Gomez canceled her shows to make treatments for this illness, on October 2015 and September 2016. A similar phenomenon occurred with depression: the interest for this topic reached its peak on August 2014, when the actor Robin Williams killed himself. Finally, ALS, a problem in the nervous system, has passed from anonymity to trending topic during the \"ice bucket challenge\", a series of home-made videos in which people threw themselves a container full of cold water to raise knowledge and collect funds for scientific research.",
  //       data: "./data/holidays-new-year.json",
  //     },
  //   },
  // },
};
