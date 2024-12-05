// Fetch and display all hostels
async function fetchHostels() {
    try {
        const response = await fetch('/api/hostels');
        const hostels = await response.json();
        displayHostels(hostels);
    } catch (error) {
        console.error('Error fetching hostels:', error);
        showAlert('Error loading hostels', 'danger');
    }
}

// Display hostels in the UI
function displayHostels(hostels) {
    const hostelsList = document.getElementById('hostelsList');
    if (!hostelsList) return;

    hostelsList.innerHTML = hostels.map(hostel => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${hostel.name}</h5>
                    <p class="card-text">
                        <strong>Location:</strong> ${hostel.location.city}, ${hostel.location.state}<br>
                        <strong>Available Rooms:</strong> ${hostel.rooms.filter(room => room.available).length}
                    </p>
                </div>
                <div class="card-footer">
                    <a href="/hostel-details.html?id=${hostel._id}" class="btn btn-primary">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('hostelsList')) {
        fetchHostels();
    }
});