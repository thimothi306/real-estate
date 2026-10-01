@extends('admin.layouts.app')

@section('title', 'Location Management')

@section('content')
<div class="page-header">
    <h1>Location Management</h1>
    <p>Manage countries, states, and cities for property listings.</p>
</div>

<div class="card" style="margin-top: 20px; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px;">
    <div class="tabs" style="display: flex; gap: 20px; border-bottom: 1px solid var(--border); margin-bottom: 20px; padding-bottom: 10px;">
        <button class="tab-btn active" onclick="switchTab('countries')" id="tab-countries" style="cursor: pointer; background: none; border: none; font-weight: 700; color: var(--primary); border-bottom: 2px solid var(--primary); padding: 5px 10px;">Countries</button>

    <div id="countries-section">
        <h3>Countries</h3>
        <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div class="search-box" style="display: flex; gap: 10px;">
                <input type="text" id="country-search" placeholder="Search country..." style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <button onclick="openCountryModal()" class="btn-primary" style="background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">+ Add Country</button>
        </div>
        <table class="admin-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                    <th style="padding: 12px;">Name</th>
                    <th style="padding: 12px;">ISO Code</th>
                    <th style="padding: 12px; text-align: right;">Actions</th>
                </tr>
            </thead>
            <tbody id="countries-list">
                <tr><td colspan="3" style="text-align: center; padding: 20px;">Loading countries...</td></tr>
            </tbody>
        </table>
    </div>

    <div id="states-section" style="display: none;">
        <h3>States</h3>
        <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div class="search-box" style="display: flex; gap: 10px;">
                <select id="state-country-filter" onchange="loadStates()" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;"></select>
                <input type="text" id="state-search" placeholder="Search state..." style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <button onclick="openStateModal()" class="btn-primary" style="background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">+ Add State</button>
        </div>
        <table class="admin-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                    <th style="padding: 12px;">Name</th>
                    <th style="padding: 12px;">Country</th>
                    <th style="padding: 12px; text-align: right;">Actions</th>
                </tr>
            </thead>
            <tbody id="states-list">
                <tr><td colspan="3" style="text-align: center; padding: 20px;">Select a country first...</td></tr>
            </tbody>
        </table>
    </div>

    <div id="cities-section" style="display: none;">
        <h3>Cities</h3>
        <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div class="search-box" style="display: flex; gap: 10px;">
                <select id="city-state-filter" onchange="loadCities()" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;"></select>
                <input type="text" id="city-search" placeholder="Search city..." style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <button onclick="openCityModal()" class="btn-primary" style="background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">+ Add City</button>
        </div>
        <table class="admin-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="text-align: left; border-bottom: 2px solid var(--border);">
                    <th style="padding: 12px;">Name</th>
                    <th style="padding: 12px;">State</th>
                    <th style="padding: 12px; text-align: right;">Actions</th>
                </tr>
            </thead>
            <tbody id="cities-list">

<div id="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
    <div id="modal-content" style="background: var(--surface); padding: 25px; border-radius: 12px; width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <h3 id="modal-title">Add Item</h3>
        <form id="location-form" style="display: flex; flex-direction: column; gap: 15px;">
            <div id="form-fields"></div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                <button type="button" onclick="closeModal()" style="padding: 8px 16px; border: 1px solid var(--border); background: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                <button type="submit" style="padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer;">Save</button>
            </div>
        </form>
    </div>
</div>

                <tr><td colspan="3" style="text-align: center; padding: 20px;">Select a state first...</td></tr>
            </tbody>

@section('scripts')
<script>
    let currentTab = 'countries';
    let currentModalType = null;
    let currentEditId = null;

    async function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.fontWeight = '500';
            btn.style.color = 'var(--muted)';
            btn.style.borderBottom = 'none';
        });
        const activeBtn = document.getElementById('tab-' + tab);
        activeBtn.classList.add('active');
        activeBtn.style.fontWeight = '700';
        activeBtn.style.color = 'var(--primary)';
        activeBtn.style.borderBottom = '2px solid var(--primary)';

        document.getElementById('countries-section').style.display = tab === 'countries' ? 'block' : 'none';
        document.getElementById('states-section').style.display = tab === 'states' ? 'block' : 'none';
        document.getElementById('cities-section').style.display = tab === 'cities' ? 'block' : 'none';

        if (tab === 'countries') loadCountries();
        if (tab === 'states') loadCountriesForFilter().then(loadStates);
        if (tab === 'cities') loadStatesForFilter();
    }

    async function loadCountries() {
        const list = document.getElementById('countries-list');
        try {
            const response = await fetch('/admin/locations/countries');
            const data = await response.json();
            list.innerHTML = data.map(c => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px;">${c.name}</td>
                    <td style="padding: 12px;">${c.iso_code}</td>
                    <td style="padding: 12px; text-align: right;">
                        <button onclick="openCountryModal(${c.id})" style="background: none; border: none; color: var(--primary); cursor: pointer; margin-right: 10px;">Edit</button>
                        <button onclick="deleteLocation('countries', ${c.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;">Delete</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align: center; padding: 20px;">No countries found.</td></tr>';
        } catch (e) {
            list.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--danger);">Error loading countries.</td></tr>';
        }
    }

    async function loadStates() {
        const countryId = document.getElementById('state-country-filter').value;
        if (!countryId) return;
        const list = document.getElementById('states-list');
        list.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Loading...</td></tr>';
        try {
            const response = await fetch(`/admin/locations/states?country_id=${countryId}`);
            const data = await response.json();
            list.innerHTML = data.map(s => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px;">${s.name}</td>
                    <td style="padding: 12px;">${s.country.name}</td>
                    <td style="padding: 12px; text-align: right;">
                        <button onclick="openStateModal(${s.id})" style="background: none; border: none; color: var(--primary); cursor: pointer; margin-right: 10px;">Edit</button>
                        <button onclick="deleteLocation('states', ${s.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;">Delete</button>
                    </td>

    async function loadCities() {
        const stateId = document.getElementById('city-state-filter').value;
        if (!stateId) return;
        const list = document.getElementById('cities-list');
        list.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Loading...</td></tr>';
        try {
            const response = await fetch(`/admin/locations/cities?state_id=${stateId}`);
            const data = await response.json();
            list.innerHTML = data.map(c => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px;">${c.name}</td>
                    <td style="padding: 12px;">${c.state.name}</td>
                    <td style="padding: 12px; text-align: right;">
                        <button onclick="openCityModal(${c.id})" style="background: none; border: none; color: var(--primary); cursor: pointer; margin-right: 10px;">Edit</button>
                        <button onclick="deleteLocation('cities', ${c.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;">Delete</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align: center; padding: 20px;">No cities found.</td></tr>';
        } catch (e) {
            list.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--danger);">Error loading cities.</td></tr>';
        }
    }

    async function loadCountriesForFilter() {
        const select = document.getElementById('state-country-filter');
        try {
            const response = await fetch('/admin/locations/countries');
            const data = await response.json();
            select.innerHTML = '<option value="">Select Country</option>' + data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } catch (e) { console.error('Error loading filter countries:', e); }
    }

    async function loadStatesForFilter() {
        const countryId = document.getElementById('state-country-filter').value || 1; 
        const select = document.getElementById('city-state-filter');
        try {
            const response = await fetch(`/admin/locations/states?country_id=${countryId}`);
            const data = await response.json();
            select.innerHTML = '<option value="">Select State</option>' + data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        } catch (e) { console.error('Error loading filter states:', e); }
    }

    function openCountryModal(id = null) {
        currentModalType = 'countries';
        currentEditId = id;
        document.getElementById('modal-title').innerText = id ? 'Edit Country' : 'Add Country';
        document.getElementById('form-fields').innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label>Name</label>
                <input type="text" name="name" id="country-name" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;" required>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label>ISO Code</label>
                <input type="text" name="iso_code" id="country-iso" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;" required>
            </div>
        `;
        if (id) {
            fetch(`/admin/locations/countries/${id}`).then(r => r.json()).then(data => {
                document.getElementById('country-name').value = data.name;
                document.getElementById('country-iso').value = data.iso_code;
            });
        }
        document.getElementById('modal-overlay').style.display = 'flex';
    }

                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align: center; padding: 20px;">No states found.</td></tr>';
        } catch (e) {
            list.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--danger);">Error loading states.</td></tr>';
        }
    }

        </table>
    </div>
</div>

        <button class="tab-btn" onclick="switchTab('states')" id="tab-states" style="cursor: pointer; background: none; border: none; font-weight: 500; color: var(--muted); padding: 5px 10px;">States</button>

    function openStateModal(id = null) {
        currentModalType = 'states';
        currentEditId = id;
        document.getElementById('modal-title').innerText = id ? 'Edit State' : 'Add State';
        document.getElementById('form-fields').innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label>Country</label>
                <select name="country_id" id="state-country-id" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;" required></select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label>Name</label>
                <input type="text" name="name" id="state-name" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;" required>
            </div>
        `;
        fetch('/admin/locations/countries').then(r => r.json()).then(data => {
            const select = document.getElementById('state-country-id');
            select.innerHTML = data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            if (id) {
                fetch(`/admin/locations/states/${id}`).then(r => r.json()).then(data => {
                    select.value = data.country_id;
                    document.getElementById('state-name').value = data.name;
                });
            }
        });
        document.getElementById('modal-overlay').style.display = 'flex';
    }

    function openCityModal(id = null) {
        currentModalType = 'cities';
        currentEditId = id;
        document.getElementById('modal-title').innerText = id ? 'Edit City' : 'Add City';
        document.getElementById('form-fields').innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label>State</label>
                <select name="state_id" id="city-state-id" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;" required></select>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <label>Name</label>
                <input type="text" name="name" id="city-name" style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;" required>
            </div>
        `;
        fetch('/admin/locations/states?country_id=1').then(r => r.json()).then(data => {
            const select = document.getElementById('city-state-id');
            select.innerHTML = data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            if (id) {
                fetch(`/admin/locations/cities/${id}`).then(r => r.json()).then(data => {
                    select.value = data.state_id;
                    document.getElementById('city-name').value = data.name;
                });
            }
        }
        );
        document.getElementById('modal-overlay').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    }

        <button class="tab-btn" onclick="switchTab('cities')" id="tab-cities" style="cursor: pointer; background: none; border: none; font-weight: 500; color: var(--muted); padding: 5px 10px;">Cities</button>
    </div>


    document.getElementById('location-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const url = `/admin/locations/${currentModalType}`;
        const method = currentEditId ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url + (currentEditId ? '/' + currentEditId : ''), {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                closeModal();
                if (currentModalType === 'countries') loadCountries();
                else if (currentModalType === 'states') loadStates();
                else if (currentModalType === 'cities') loadCities();
            } else {
                alert('Error saving location.');
            }
        } catch (e) {
            alert('Error saving location.');
        }
    };

    async function deleteLocation(type, id) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const response = await fetch(`/admin/locations/${type}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                }
            });
            if (response.ok) {
                if (type === 'countries') loadCountries();
                else if (type === 'states') loadStates();
                else if (type === 'cities') loadCities();
            } else {
                alert('Error deleting location.');
            }
        } catch (e) {
            alert('Error deleting location.');
        }
    }

    // Initial load
    switchTab('countries');
</script>
@endsection

@endsection
