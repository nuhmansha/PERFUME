    (function ($) {
        "use strict";
      const salesEndpoint = '/admin/chart';

fetch(salesEndpoint)
    .then(response => response.json())
    .then(salesData => {
        console.log(salesData);

        // Create an array with sales data for each month
        const monthlySales = Array.from({ length: 12 }, (_, month) => {
            const dataForMonth = salesData.find(monthlyData => monthlyData.month === (month + 1)); // Adjust month value
            return dataForMonth ? dataForMonth.totalAmount : 0;
        });

        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Sales',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                    data: monthlySales,
                }],
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    },
                },
            },
        });
    })
    .catch(error => console.error('Error fetching sales data:', error));

// Event listener for the "Fetch Weekly Chart" button
$('#fetchWeeklyChart').on('click', function () {
    const weeklySalesEndpoint = '/admin/weeklyChart';

    fetch(weeklySalesEndpoint)
        .then(response => response.json())
        .then(weeklySalesData => {
            console.log(weeklySalesData);

            // Create an array with sales data for each week
            const weeklySales = Array.from({ length: 52 }, (_, week) => {
                const dataForWeek = weeklySalesData.find(order => order.week === week + 1);

                return dataForWeek ? dataForWeek.totalAmount : 0;
            });

            var ctxWeekly = document.getElementById('myWeeklyChart').getContext('2d');
            var chartWeekly = new Chart(ctxWeekly, {
                type: 'line',
                data: {
                    labels: Array.from({ length: 52 }, (_, week) => `Week ${week + 1}`),
                    datasets: [{
                        label: 'Weekly Sales',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data: weeklySales,
                    }],
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                usePointStyle: true,
                            },
                        },
                    },
                },
            });
        })
        .catch(error => console.error('Error fetching weekly sales data:', error));
});

        /*Sale statistics Chart*/
        if ($('#myChart2').length) {
            const paymentEndpoint = '/admin/paymentChart';
        
            fetch(paymentEndpoint)
                .then(response => response.json())
                .then(paymentData => {
                    console.log(paymentData);
        
                    const paymentLabels = paymentData.map(entry => entry._id);
                    const paymentValues = paymentData.map(entry => entry.totalAmount);
        
                    var ctxPayment = document.getElementById('myChart2').getContext('2d');
                    var chartPayment = new Chart(ctxPayment, {
                        type: 'bar',
                        data: {
                            labels: paymentLabels,
                            datasets: [{
                                label: 'Payment Method',
                                backgroundColor: ['#5897fb', '#7bcf86', '#ff9076'], // Adjust colors as needed
                                barThickness: 30,
                                data: paymentValues,
                            }],
                        },
                        options: {
                            plugins: {
                                legend: {
                                    labels: {
                                        usePointStyle: true,
                                    },
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                },
                            },
                        },
                    });
                })
                .catch(error => console.error('Error fetching payment data:', error));
        }
        
        
    })(jQuery);