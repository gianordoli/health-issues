module.exports = [
  {
    title: 'Search Interest',
    content: [
      'This is your usual <a href="https://trends.google.com/trends/explore?date=2004-01-01%202016-12-31&q=%2Fm%2F0cycc" target="_blank">Google Trends chart</span>. <span class="highlight">Search interest</span> is measured from 0 (no interest) to 100 (popularity peak) for a given term.',
      'We can see the Swine Flu epidemics spikes in 2009, but it’s hard to tell from this view whether there’s any seasonality in the data',
    ]
  },
  {
    title: 'A Yearly Pattern',
    content: [
      'Zooming into each year, we can see that the interest is low during Spring and Summer, and starts rising as we approach the Fall.',
      'However, the values vary a lot from one year to another — with 2009 being an obvious outlier.',
      'How can we find the <span class="highlight">“typical” yearly cycle</span> for the flu? Let’s step back to our 12-year period chart.',
    ]
  },
  {
    title: 'Trend versus Total',
    content: [
      'First, let’s draw what seems to be the <span class="highlight">variation independent of the spikes.</span> This gives us the trend over time.',
      'The difference between these 2 lines is what we’ll use to determine the yearly cycle.',
    ]
  },
  {
    title: 'Total Minus Trend',
    content: [
      'This is what we get by plotting the difference between trend and total.',
      'We’re still using a 100-point range scale, but some of our values are negative because they are <span class="highlight">relative to the trend line,</span> not to the actual search interest.',
    ]
  },
  {
    title: 'Seasonal Interest',
    content: [
      'To take that out, we combine all years into a single cycle, leaving what doesn’t seem to represent a seasonal pattern out. This gives us <b>seasonal interest per year</b> for influenza.',
    ]
  },
];
