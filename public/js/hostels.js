let hostels = [];

// Fetch all hostels
async function fetchHostels() {
    try {
        const response = await fetch('/api/hostels');
        if (!response.ok) {
            throw new Error('Failed to fetch hostels');
        }
        hostels = await response.json();
        displayHostels(hostels); // Display all hostels by default
    } catch (error) {
        showAlert('Error loading hostels', 'danger');
    }
}

// Display hostels
function displayHostels(hostelsToShow) {
    const hostelsList = document.getElementById('hostelsList');
    if (!hostelsToShow.length) {
        hostelsList.innerHTML = '<div class="col-12"><p class="text-center">No hostels found.</p></div>';
        return;
    }

    hostelsList.innerHTML = hostelsToShow.map(hostel => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${hostel.name}</h5>
                    <p class="card-text">
                        <strong>Location:</strong> ${hostel.location?.city || 'N/A'}, ${hostel.location?.state || 'N/A'}<br>
                    </p>
                    <button class="btn btn-primary" onclick="showHostelDetails('${hostel._id}')">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Show hostel details in modal
async function showHostelDetails(hostelId) {
    try {
        const response = await fetch(`/api/hostels/${hostelId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch hostel details');
        }
        const hostel = await response.json();

        const modalContent = document.getElementById('hostelDetailsContent');
        modalContent.innerHTML = `
            <h4>${hostel.name}</h4>
            <p><strong>Location:</strong> ${hostel.location?.address || 'N/A'}, ${hostel.location?.city || 'N/A'}, ${hostel.location?.state || 'N/A'}</p>
            <p><strong>Description:</strong> ${hostel.description || 'No description available'}</p>
            
            <h5>Available Rooms:</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Room Number</th>
                            <th>Type</th>
                            <th>Capacity</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(hostel.rooms || []).map(room => `
                            <tr>
                                <td>${room.roomNumber}</td>
                                <td>${room.type}</td>
                                <td>${room.capacity}</td>
                                <td>₹${room.price}</td>
                                <td>${room.available ? '<span class="badge bg-success">Available</span>' : '<span class="badge bg-danger">Occupied</span>'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            
            
            <h5>Contact Information:</h5>
            <p>
                Phone: ${hostel.contactInfo?.phone || 'N/A'}<br>
                Email: ${hostel.contactInfo?.email || 'N/A'}
            </p>
        `;

        new bootstrap.Modal(document.getElementById('hostelDetailsModal')).show();
    } catch (error) {
        showAlert('Error loading hostel details', 'danger');
    }
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
document.addEventListener('DOMContentLoaded', fetchHostels);
