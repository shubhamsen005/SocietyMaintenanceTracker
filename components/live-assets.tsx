'use client';
import { useEffect, useState } from 'react';
import { QrCode, ExternalLink, Copy, Check, Printer, Camera, ShieldCheck, Activity, Building2, X, AlertTriangle } from 'lucide-react';

type Asset = {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  healthScore: number;
  status: string;
  _count: { complaints: number };
};

type Detail = {
  asset: Asset & { complaints?: { id: string; displayId: string; category: string; description: string; status: string; createdAt: string }[] };
  reportUrl: string;
  qrDataUrl: string;
};

export default function LiveAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  useEffect(() => {
    fetch('/api/assets')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setAssets(data.items))
      .catch(() => setError('Unable to load assets.'));
  }, []);

  const show = async (id: string) => {
    const r = await fetch(`/api/assets/${id}`);
    if (r.ok) {
      setDetail(await r.json());
      setCopied(false);
    } else {
      setError('Unable to load asset passport.');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const printQR = () => {
    if (!detail) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Asset QR Tag - ${detail.asset.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
            .card { border: 2px dashed #185e58; padding: 30px; display: inline-block; border-radius: 16px; max-width: 320px; }
            h2 { margin: 10px 0 5px; color: #185e58; }
            p { margin: 0 0 15px; color: #666; font-size: 13px; }
            img { width: 220px; height: 220px; }
            .code { font-family: monospace; font-weight: bold; background: #eef5f3; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="code">${detail.asset.code}</div>
            <h2>${detail.asset.name}</h2>
            <p>${detail.asset.category} · ${detail.asset.location}</p>
            <img src="${detail.qrDataUrl}" alt="QR Code" />
            <p style="margin-top: 15px; font-size: 11px;">Scan to report maintenance issues</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="page">
      <div className="eyebrow">ASSET PASSPORTS & QR MANAGEMENT</div>
      <div className="heading-row">
        <div>
          <h1>Society assets</h1>
          <p>Every critical asset has a maintenance passport and QR-ready reporting link.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary" onClick={() => setScannerOpen(true)}>
            <Camera size={17} /> Scan / Test Asset QR
          </button>
        </div>
      </div>

      {error && <p className="red">{error}</p>}

      <div className="asset-grid">
        {assets.map(asset => (
          <section className="card asset" key={asset.id} style={{ cursor: 'pointer' }} onClick={() => show(asset.id)}>
            <div className="asset-top">
              <span className="asset-icon"><Building2 size={21} /></span>
              <button
                className="secondary"
                style={{ padding: '6px 10px', fontSize: '11px' }}
                onClick={(e) => { e.stopPropagation(); show(asset.id); }}
                title="View QR Passport"
              >
                <QrCode size={16} /> Passport
              </button>
            </div>
            <span className="section-label">{asset.code}</span>
            <h2>{asset.name}</h2>
            <p>{asset.category} · {asset.location}</p>
            <div className="asset-bottom">
              <span>Health <b>{asset.healthScore}/100</b></span>
              <span className={`pill ${asset.healthScore > 75 ? 'resolved' : asset.healthScore > 50 ? 'medium' : 'critical'}`}>
                {asset.status}
              </span>
            </div>
          </section>
        ))}
      </div>

      {/* QR Passport Drawer Modal */}
      {detail && (
        <div className="drawer-wrap">
          <div className="drawer-backdrop" onClick={() => setDetail(null)} />
          <aside className="drawer">
            <button className="close" onClick={() => setDetail(null)}>
              <X size={18} />
            </button>
            <span className="section-label">ASSET PASSPORT · {detail.asset.code}</span>
            <h2>{detail.asset.name}</h2>
            <p style={{ marginBottom: '20px' }}>{detail.asset.category} · {detail.asset.location}</p>

            <div className="card" style={{ textAlign: 'center', padding: '24px', background: '#fcfdfc', marginBottom: '20px' }}>
              <img
                src={detail.qrDataUrl}
                alt={`QR code for ${detail.asset.name}`}
                width="200"
                height="200"
                style={{ borderRadius: '12px', border: '1px solid var(--line)', padding: '10px', background: 'white' }}
              />
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className="secondary" onClick={printQR}>
                  <Printer size={15} /> Print QR Tag
                </button>
                <a className="primary" href={detail.reportUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={15} /> Test Form
                </a>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
              <span className="section-label">DIRECT QR REPORTING URL</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={detail.reportUrl}
                  style={{
                    flex: 1,
                    fontSize: '11px',
                    padding: '8px 10px',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    background: '#f6f8f7',
                    color: 'var(--ink)'
                  }}
                />
                <button className="secondary" onClick={() => copyUrl(detail.reportUrl)}>
                  {copied ? <Check size={16} color="#27726a" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="section-label">MAINTENANCE HEALTH</span>
                <span className={`pill ${detail.asset.healthScore > 75 ? 'resolved' : detail.asset.healthScore > 50 ? 'medium' : 'critical'}`}>
                  {detail.asset.healthScore}/100 HEALTH
                </span>
              </div>
              <div className="meter" style={{ margin: '8px 0 14px' }}>
                <i style={{ width: `${detail.asset.healthScore}%` }} />
              </div>
              <p style={{ fontSize: '12px' }}>
                Total <b>{detail.asset._count?.complaints || 0} complaint(s)</b> logged against this asset.
              </p>
            </div>

            {detail.asset.complaints && detail.asset.complaints.length > 0 && (
              <div className="card">
                <span className="section-label">RECENT COMPLAINT HISTORY</span>
                <div style={{ marginTop: '10px', display: 'grid', gap: '10px' }}>
                  {detail.asset.complaints.map(c => (
                    <div key={c.id} style={{ fontSize: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{c.displayId} · {c.category}</span>
                        <span className="pill low">{c.status.replace(/_/g, ' ')}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* QR Scanner Simulation Modal */}
      {scannerOpen && (
        <div className="drawer-wrap">
          <div className="drawer-backdrop" onClick={() => setScannerOpen(false)} />
          <div
            className="card"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(480px, calc(100% - 32px))',
              zIndex: 101,
              padding: '28px',
              textAlign: 'center'
            }}
          >
            <button
              className="close"
              style={{ position: 'absolute', top: '16px', right: '16px' }}
              onClick={() => setScannerOpen(false)}
            >
              <X size={18} />
            </button>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#e6f0ed',
                color: '#185e58',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Camera size={28} />
            </div>
            <h2>Simulate QR Asset Scan</h2>
            <p style={{ fontSize: '13px', margin: '8px 0 20px' }}>
              Select a physical asset QR tag to simulate scanning it with a mobile camera.
            </p>

            <select
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                fontSize: '13px',
                marginBottom: '20px'
              }}
            >
              <option value="">-- Choose an asset tag --</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  [{a.code}] {a.name} — {a.location}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="secondary" onClick={() => setScannerOpen(false)}>
                Cancel
              </button>
              <button
                className="primary"
                disabled={!selectedAssetId}
                onClick={() => {
                  setScannerOpen(false);
                  show(selectedAssetId);
                }}
              >
                Scan & View Passport &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
