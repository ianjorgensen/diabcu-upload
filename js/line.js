// quarterly data, custom colors, skinny lines
Morris.Line({
  element: 'quarterly',
  data: [
    {q: '2012 Q2', a: 100, b: 75},
    {q: '2011 Q4', a: 75, b: 50},
    {q: '2011 Q3', a: 50, b: 25},
    {q: '2011 Q1', a: 50, b: 25},
    {q: '2010 Q3', a: 75, b: 50},
    {q: '2010 Q2', a: 75, b: 50},
    {q: '2009 Q3', a: 100, b: 75}
  ],
  xkey: 'q',
  ykeys: ['a', 'b'],
  labels: ['Series A', 'Series B'],
  lineColors: ['#167f39','#044c29'],
  lineWidth: 2
});