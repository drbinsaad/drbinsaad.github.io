(function () {
    const statsPath = './assets/data/scholar_stats.json';

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function formatNumber(value) {
        if (typeof value !== 'number') {
            return '--';
        }
        return new Intl.NumberFormat('en-US').format(value);
    }

    function formatTimestamp(value) {
        if (!value) {
            return 'Stats snapshot unavailable';
        }

        const normalized = String(value)
            .replace(/\s+UTC$/i, 'Z')
            .replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T');
        const parsed = new Date(normalized);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        }).format(parsed);
    }

    function renderPublications(publications) {
        const list = document.getElementById('dashboardPublications');
        if (!list) {
            return;
        }

        list.innerHTML = '';

        if (!Array.isArray(publications) || publications.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'publication-item';
            empty.textContent = 'Publication data unavailable.';
            list.appendChild(empty);
            return;
        }

        publications.slice(0, 4).forEach((publication) => {
            const item = document.createElement('div');
            item.className = 'publication-item';

            const year = document.createElement('time');
            year.textContent = publication.year || 'Recent';

            const link = document.createElement('a');
            link.href = publication.url || 'https://scholar.google.com/citations?user=dCBScAcAAAAJ';
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = publication.title || 'Untitled publication';

            const citation = document.createElement('p');
            citation.textContent = publication.citation || publication.authors || 'Citation details unavailable';

            item.appendChild(year);
            item.appendChild(link);
            item.appendChild(citation);
            list.appendChild(item);
        });
    }

    async function loadDashboardStats() {
        try {
            const response = await fetch(statsPath, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const timestamp = formatTimestamp(data.last_updated);

            setText('metricCitations', formatNumber(data.citations));
            setText('metricPublications', formatNumber(data.publications));
            setText('metricHIndex', formatNumber(data.h_index));
            setText('dashboardUpdated', timestamp);
            setText('statsTimestamp', `Scholar snapshot: ${timestamp}`);
            renderPublications(data.recent_publications);
        } catch (error) {
            console.error('Unable to load dashboard stats:', error);
            setText('metricCitations', 'N/A');
            setText('metricPublications', 'N/A');
            setText('metricHIndex', 'N/A');
            setText('dashboardUpdated', 'Scholar snapshot unavailable');
            setText('statsTimestamp', 'Stats unavailable');
            renderPublications([]);
        }
    }

    document.addEventListener('DOMContentLoaded', loadDashboardStats);
})();
