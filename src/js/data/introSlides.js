module.exports = [
  {
    title: 'Search Interest',
    copy: [
      'This is your usual <a href="https://trends.google.com/trends/explore?date=2004-01-01%202016-12-31&q=%2Fm%2F0cycc" target="_blank">Google Trends chart</a>. <span class="highlight">Search interest</span> is measured from 0 (no interest) to 100 (popularity peak) for a given term.',
      'We can see the Swine Flu epidemics spikes in 2009, but it’s hard to tell from this view whether there’s any seasonality in the data',
    ]
  },
  {
    title: 'A Yearly Pattern',
    copy: [
      'Zooming into each year, we can see that the interest is in general lower in the middle of the year than it is in the final and first months.',
      'The values vary a lot from one year to another though — with 2009 being an obvious outlier.',
      'How can we find the <span class="highlight">“typical” yearly cycle</span> for the flu? Let’s step back to our 12-year chart.',
    ]
  },
  {
    title: 'Trend versus Total',
    copy: [
      'First, let’s draw what seems to be the <span class="highlight">variation independent of the spikes.</span> This gives us the trend over time.',
      'The difference between these 2 lines is what we’ll use to determine the yearly cycle.',
    ]
  },
  {
    title: 'Total Minus Trend',
    copy: [
      'This is what we get by plotting the difference between trend and total.',
      'Notice that some of the values in our scale are negative. That is because they are <span class="highlight">relative to the trend line,</span> not to the actual search interest.',
    ]
  },
  {
    title: 'Seasonal Interest',
    copy: [
      'Combining all the seasonal data from multiple years into a single cycle, we can determine the <span class="highlight">seasonal interest per year</span> for the flu.',
    ]
  },
];
