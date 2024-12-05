// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
}

// Fetch owner's hostels
async function fetchMyHostels() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/hostels/my-hostels', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch hostels');
        }

        const hostels = await response.json();
        displayMyHostels(hostels);
    } catch (error) {
        showAlert('Error fetching hostels', 'danger');
    }
}

// Display owner's hostels
function displayMyHostels(hostels) {
    const hostelsList = document.getElementById('hostelsList');
    if (hostels.length === 0) {
        hostelsList.innerHTML = '<div class="col-12"><p class="text-center">No hostels added yet.</p></div>';
        return;
    }

    hostelsList.innerHTML = hostels.map(hostel => `
        <div class="col-md-4 mb-4">
            <div class="card hostel-card">
                <div class="card-body">
                    <h5 class="card-title">${hostel.name}</h5>
                    <p class="card-text">
                        <strong>Location:</strong> ${hostel.location?.city || 'N/A'}, ${hostel.location?.state || 'N/A'}<br>
                        <strong>Available Rooms:</strong> ${(hostel.rooms || []).filter(room => room.available).length}
                    </p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary me-2" onclick="editHostel('${hostel._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteHostel('${hostel._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add room field
function addRoomField(room = {}) {
    const roomsList = document.getElementById('roomsList');
    const roomDiv = document.createElement('div');
    roomDiv.className = 'room-entry border rounded p-3 mb-3';
    roomDiv.innerHTML = `
        <div class="row">
            <div class="col-md-3 mb-2">
                <label class="form-label">Room Number</label>
                <input type="text" class="form-control" name="rooms[][roomNumber]" value="${room.roomNumber || ''}" required>
            </div>
            <div class="col-md-3 mb-2">
                <label class="form-label">Type</label>
                <input type="text" class="form-control" name="rooms[][type]" value="${room.type || ''}" required>
            </div>
            <div class="col-md-2 mb-2">
                <label class="form-label">Capacity</label>
                <input type="number" class="form-control" name="rooms[][capacity]" value="${room.capacity || ''}" required>
            </div>
            <div class="col-md-2 mb-2">
                <label class="form-label">Price</label>
                <input type="number" class="form-control" name="rooms[][price]" value="${room.price || ''}" required>
            </div>
            <div class="col-md-2 mb-2">
                <label class="form-label">Available</label>
                <select class="form-select" name="rooms[][available]">
                    <option value="true" ${room.available ? 'selected' : ''}>Yes</option>
                    <option value="false" ${!room.available ? 'selected' : ''}>No</option>
                </select>
            </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm mt-2" onclick="this.parentElement.remove()">Remove Room</button>
    `;
    roomsList.appendChild(roomDiv);
}

// Edit hostel
async function editHostel(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/hostels/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch hostel details');
        }
        
        const hostel = await response.json();
        
        // Update modal title
        document.querySelector('#addHostelModal .modal-title').textContent = 'Edit Hostel';
        document.getElementById('hostelId').value = hostel._id;
        
        // Populate form fields
        const form = document.getElementById('addHostelForm');
        form.querySelector('[name="name"]').value = hostel.name;
        form.querySelector('[name="location.address"]').value = hostel.location?.address || '';
        form.querySelector('[name="location.city"]').value = hostel.location?.city || '';
        form.querySelector('[name="location.state"]').value = hostel.location?.state || '';
        form.querySelector('[name="location.zipCode"]').value = hostel.location?.zipCode || '';
        form.querySelector('[name="description"]').value = hostel.description || '';
        form.querySelector('[name="contactInfo.phone"]').value = hostel.contactInfo?.phone || '';
        form.querySelector('[name="contactInfo.email"]').value = hostel.contactInfo?.email || '';
        
        // Clear existing rooms
        document.getElementById('roomsList').innerHTML = '';
        
        // Add room fields
        if (hostel.rooms && hostel.rooms.length > 0) {
            hostel.rooms.forEach(room => addRoomField(room));
        }
        
        // Show modal
        new bootstrap.Modal(document.getElementById('addHostelModal')).show();
    } catch (error) {
        showAlert('Error fetching hostel details', 'danger');
    }
}

// Add/Edit hostel form submission
const addHostelForm = document.getElementById('addHostelForm');
if (addHostelForm) {
    addHostelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addHostelForm);
        const hostelId = formData.get('hostelId');
        
        // Construct rooms array
        const rooms = [];
        const roomNumbers = formData.getAll('rooms[][roomNumber]');
        const roomTypes = formData.getAll('rooms[][type]');
        const roomCapacities = formData.getAll('rooms[][capacity]');
        const roomPrices = formData.getAll('rooms[][price]');
        const roomAvailability = formData.getAll('rooms[][available]');
        
        for (let i = 0; i < roomNumbers.length; i++) {
            rooms.push({
                roomNumber: roomNumbers[i],
                type: roomTypes[i],
                capacity: parseInt(roomCapacities[i]),
                price: parseFloat(roomPrices[i]),
                available: roomAvailability[i] === 'true'
            });
        }
        
        const hostelData = {
            name: formData.get('name'),
            location: {
                address: formData.get('location.address'),
                city: formData.get('location.city'),
                state: formData.get('location.state'),
                zipCode: formData.get('location.zipCode')
            },
            description: formData.get('description'),
            contactInfo: {
                phone: formData.get('contactInfo.phone'),
                email: formData.get('contactInfo.email')
            },
            rooms: rooms
        };

        try {
            const token = localStorage.getItem('token');
            const url = hostelId ? `/api/hostels/${hostelId}` : '/api/hostels';
            const method = hostelId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(hostelData)
            });

            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('addHostelModal'));
                modal.hide();
                addHostelForm.reset();
                document.getElementById('roomsList').innerHTML = '';
                document.getElementById('hostelId').value = '';
                document.querySelector('#addHostelModal .modal-title').textContent = 'Add New Hostel';
                await fetchMyHostels();
                showAlert(`Hostel ${hostelId ? 'updated' : 'added'} successfully`, 'success');
            } else {
                const data = await response.json();
                showAlert(data.message || `Error ${hostelId ? 'updating' : 'adding'} hostel`, 'danger');
            }
        } catch (error) {
            showAlert(`Error ${hostelId ? 'updating' : 'adding'} hostel`, 'danger');
        }
    });
}

// Delete hostel
async function deleteHostel(id) {
    if (!confirm('Are you sure you want to delete this hostel?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/hostels/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await fetchMyHostels();
            showAlert('Hostel deleted successfully', 'success');
        } else {
            const data = await response.json();
            showAlert(data.message || 'Error deleting hostel', 'danger');
        }
    } catch (error) {
        showAlert('Error deleting hostel', 'danger');
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

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
    checkAuth();
    fetchMyHostels();
});

// Reset form when modal is closed
document.getElementById('addHostelModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('addHostelForm').reset();
    document.getElementById('roomsList').innerHTML = '';
    document.getElementById('hostelId').value = '';
    document.querySelector('#addHostelModal .modal-title').textContent = 'Add New Hostel';
});