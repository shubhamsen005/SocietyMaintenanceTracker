'use client';
import { useRouter } from 'next/navigation';
import PersistentIntake from '@/components/persistent-intake';
export default function AssetReportClient({assetId}:{assetId:string}){const router=useRouter();return <PersistentIntake assetId={assetId} close={()=>router.push('/resident')} done={()=>router.push('/resident')}/>}
