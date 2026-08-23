import AssetReportClient from '@/components/asset-report-client';
export default async function AssetReport({params}:{params:Promise<{assetId:string}>}){const {assetId}=await params;return <AssetReportClient assetId={assetId}/>}
