
    document.addEventListener('DOMContentLoaded', function() {
    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Dropdown functionality
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    dropdownBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-btn') && !event.target.matches('.admin-avatar') && !event.target.matches('.fa-chevron-down')) {
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
            }
        }
    });

    // Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Sales',
                    data: [30, 15, 5, 10, 20, 30, 22, 30, 25, 18, 15, 10],
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Visitors',
                    data: [20, 25, 18, 8, 15, 35, 40, 35, 30, 25, 22, 16],
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Products',
                    data: [15, 20, 25, 30, 25, 20, 15, 20, 25, 30, 35, 20],
                    borderColor: '#ed8936',
                    backgroundColor: 'rgba(237, 137, 54, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#222831',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    borderColor: '#2d3748',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(45, 55, 72, 0.5)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(45, 55, 72, 0.5)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                }
            }
        }
    });

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['900', '1200', '1400', '1800'],
            datasets: [
                {
                    label: 'US',
                    data: [200, 300, 450, 600],
                    backgroundColor: '#4299e1',
                    borderRadius: 4
                },
                {
                    label: 'Europe',
                    data: [300, 400, 350, 500],
                    backgroundColor: '#48bb78',
                    borderRadius: 4
                },
                {
                    label: 'Asian',
                    data: [150, 250, 300, 400],
                    backgroundColor: '#ed8936',
                    borderRadius: 4
                },
                {
                    label: 'Africa',
                    data: [100, 150, 100, 200],
                    backgroundColor: '#d53f8c',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#222831',
                    titleColor: '#e6e6e6',
                    bodyColor: '#e6e6e6',
                    borderColor: '#2d3748',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(45, 55, 72, 0.5)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(45, 55, 72, 0.5)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                }
            }
        }
    });

    // Pie Chart for Marketing Channels
    const marketingData = {
        facebook: 15,
        instagram: 35,
        google: 45,
        twitter: 5
    };

    // Update progress bars for marketing channels
    Object.entries(marketingData).forEach(([channel, value]) => {
        const channelElements = document.querySelectorAll('.channel-item');
        channelElements.forEach(element => {
            const channelName = element.querySelector('.channel-info span:first-child').textContent.toLowerCase();
            if (channelName.toLowerCase() === channel.toLowerCase()) {
                const progressBar = element.querySelector('.progress');
                progressBar.style.width = `${value}%`;
            }
        });
    });

    // Handle window resize for responsive charts
    window.addEventListener('resize', function() {
        salesChart.resize();
        revenueChart.resize();
    });
});