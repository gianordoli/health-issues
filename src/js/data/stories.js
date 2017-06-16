module.exports = {
  seasonal: {
    title: "Seasons",
    intro: "The most obvious thing affecting seasonality in searches for diseases are... the seasons. Or rather, the impact of environmental conditions in our general health. Because of that, Northern and Southern hemispheres experience opposite throughout the year. Compare the data from US and Australia below to see how.",
    cases: [
      {
        title: "Spring",
        data: "./data/seasonal-spring.json",
        terms: ["Chickenpox", "Conjunctivitis", "Allergy"],
        geoList: ["US", "AU"],
        chartType: "seasonal",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "The flower season is beautiful, but can become a nightmare for allergics. This happens because plants release pollen, a substance that causes varied reactions. In some cases, it triggers rhinitis. In others, it is responsible for conjunctivitis. The eye problem, by the way, can also be caused by viruses and bacteria, that are often transmitted in pools and gyms — interestingly, people start to visit these places more often when the weather starts to heat up. Finally, chickenpox virus has an increased activity and spreads more easily during spring."
        ],
      },
      {
        title: "Summer",
        data: "./data/seasonal-summer.json",
        terms: ["Candidiasis", "Skin rash", "Diarrhea"],
        geoList: ["US", "AU"],
        chartType: "seasonal",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Summer is perfect for the fungus Candida albicans, that lives naturally in our organism: the use of wet bikinis and trunks for long periods allow a high proliferation of this specie in vagina and in penis, causing candidiasis. The heat is also ideal for the fast multiplication of bacteria that promotes diarrhea. The skin can suffer during this season for many motives. One of them is the block of sweat glands by lotions and beauty products. Without perspiration, skin rash, itchiness and red spots appear. "
        ],
      },
      {
        title: "Winter",
        data: "./data/seasonal-winter.json",
        terms: ["Bronchitis", "Raynaud syndrome", "Cold"],
        geoList: ["US", "AU"],
        chartType: "seasonal",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Copy about Winter. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      }
    ],
  },
  holidays: {
    title: "Holidays",
    intro: "Not only the environment can affect your health. Major events help spread diseases by bringing too many people together — or simply by exposing your body to things it is not used to. Take a look into how these parties can threat your physical condition.",
    cases: [
      {
        title: "Diwali Festival",
        data: "./data/holidays-diwali-festival.json",
        terms: ["Burn", "Pain"],
        geoList: ["IN"],
        chartType: "seasonal",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Diwali is one of the most important festivals for Hinduism. Celebrated during five days among October and November, people solemnize the victory of light over darkness, good over evil, knowledge over ignorance. It is usual that individuals light many candles on windows, all over their homes and in temples. Curiously, it is possible to notice during the days of the holiday an increase in the searches about burn and pain in India."
        ],
      },
      {
        title: "Brazilian Carnival",
        data: "./data/holidays-brazilian-carnival.json",
        terms: ["Mononucleosis"],
        geoList: ["BR"],
        chartType: "seasonal",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Also known as “kissing disease”, mononucleosis becomes a common search in Brazil right after the Carnival on February. The popular festival, word-renowned for samba, creative costumes and happiness, is also a great opportunity to meet new people — and, eventually, kiss a lot. The problem is that Epstein-Barr virus, the villain of this infection, is transmitted by contact with someone else’s saliva. The disease can cause fever and swelling of lymph nodes on neck and armpit."
        ],
      },
      {
        title: "New Year",
        data: "./data/holidays-new-year.json",
        terms: ["Winter vomiting bug", "Chest pain"],
        geoList: ["world"],
        chartType: "seasonal",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Copy about New Year. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
    ],
  },
  media: {
    title: "Media",
    intro: "A growing interest in a particular disease doesn't mean more people are getting sick. Advertisement, celebrities, and the news can boost searches for a term as well. See how the media can raise awareness — or concern — around health.",
    cases: [
      {
        title: "Campaigns",
        data: "./data/media-campaigns.json",
        terms: ["Down's syndrome", "Breast Cancer", "Autism"],
        geoList: ["world"],
        chartType: "seasonal",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Not every growth in searches is directly related with an increase in cases of a disease. Examples of that are the big campaigns of consciousness that happen during the year. Above, you can see three examples: Down’s Syndrome, which international day of awareness is always celebrated on March 21st, autism, remembered on April 2nd, and breast cancer, which movement occur during the entire month of October.",
        ],
      },
      {
        title: "Pop Culture",
        data: "./data/media-pop-culture.json",
        terms: ["Lupus", "Amyotrophic lateral sclerosis"],
        geoList: ["world"],
        chartType: "trend",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Celebrities also play a major role in the popularity of certain health topics. That's what happened with lupus, an inflammatory disease that affects joints, skin and kidneys. The number of searches increased when the singer Selena Gomez canceled her shows to make treatments for this illness, on October 2015 and September 2016. Amyotrophic Lateral Sclerosis, a problem in the nervous system, has passed from anonymity to trending topic on the \"ice bucket challenge\" during July and August of 2014."
        ],
      },
      {
        title: "Anti-vaccine",
        data: "./data/media-anti-vaccine.json",
        terms: ["Measles"],
        geoList: ["US"],
        chartType: "trend",
        copyTitle: 'Lorem Ipsum',
        copy: [
          "In 1998, British researcher Andrew Wakefield published a paper claiming that vaccines cause autism in children. The idea gained popularity and had a boost when some celebrities, like Jim Carrey and Charlie Sheen, declared their support to the anti-immunization movement. Nowadays, it is well-known that there is no proven link between vaccines and autism — Wakefield also lost his medical registry. To make matters worse, unvaccinated children ended up triggering a measles epidemics in Ohio (2014) and California (2015). It is possible to notice a raise in web searches for the infection during these periods."
        ],
      },
    ],
  },
  epidemics: {
    title: "Epidemics",
    intro: "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
    cases: [
      {
        title: "Ebola",
        mapData: "./data/epidemics-ebola.json",
        chartData: "./data/epidemics-ebola-time-series.json",
        terms: ["Ebola"],
        geoList: ["world"],
        years: [2014, 2015],
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Copy about Ebola Epidemic. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
      {
        title: "Zika",
        mapData: "./data/epidemics-zika.json",
        chartData: "./data/epidemics-zika-time-series.json",
        terms: ["Zika virus"],
        geoList: ["world"],
        years: [2015, 2016],
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Copy about Zika virus. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
      {
        title: "MERS",
        mapData: "./data/epidemics-mers.json",
        chartData: "./data/epidemics-mers-time-series.json",
        terms: ["MERS"],
        geoList: ["world"],
        years: [2013, 2015],
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Copy about MERS. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
      {
        title: "Yellow Fever",
        mapData: "./data/epidemics-yellow-fever.json",
        chartData: "./data/epidemics-yellow-fever-time-series.json",
        terms: ["Yellow fever"],
        geoList: ["world"],
        years: [2016, 2017],
        copyTitle: 'Lorem Ipsum',
        copy: [
          "Copy about Yellow Fever. More than one paragraph. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
          "Lorem ipsum bibendum in. Aptent malesuada tempus Donec dolor. Luctus tempus In Donec dictum metus elit. Molestie. Pharetra a ultrices maximus vel amet, nisi nibh vel vitae. dictum metus elit.",
        ],
      },
    ],
  },
};
