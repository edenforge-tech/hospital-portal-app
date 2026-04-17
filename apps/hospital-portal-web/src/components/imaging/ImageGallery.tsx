'use client';

import { useState, useEffect } from 'react';
import { X, Download, Calendar, AlertCircle } from 'lucide-react';
import { useDeleteConfirmation } from '@/components/common/ConfirmationDialog';

interface ImageGalleryProps {
  orderId: string;
  onImageSelect?: (image: ImagingImage) => void;
}

interface ImagingImage {
  id: string;
  imagingOrderId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  width?: number;
  height?: number;
  modality: string;
  uploadedAt: string;
  annotations?: Annotation[];
}

interface Annotation {
  id: string;
  annotationType: string;
  toolName: string;
  coordinates: string;
  measurementValue?: number;
  measurementUnit?: string;
}

const modalityColors: Record<string, string> = {
  fundus: 'bg-purple-100 text-purple-800',
  oct: 'bg-blue-100 text-blue-800',
  visual_field: 'bg-green-100 text-green-800',
  scheimpflug: 'bg-yellow-100 text-yellow-800',
  iol_calculation: 'bg-pink-100 text-pink-800',
  ubm: 'bg-indigo-100 text-indigo-800',
  angiography: 'bg-red-100 text-red-800',
  otros: 'bg-gray-100 text-gray-800',
};

const modalityLabels: Record<string, string> = {
  fundus: 'Fundus',
  oct: 'OCT',
  visual_field: 'Visual Field',
  scheimpflug: 'Scheimpflug',
  iol_calculation: 'IOL Calc',
  ubm: 'UBM',
  angiography: 'Angiography',
  otros: 'Other',
};

export default function ImageGallery({ orderId, onImageSelect }: ImageGalleryProps) {
  const [images, setImages] = useState<ImagingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImagingImage | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const { confirmDelete, ConfirmationComponent } = useDeleteConfirmation();

  useEffect(() => {
    fetchImages();
  }, [orderId]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if this is a demo order
      if (orderId.startsWith('demo-')) {
        // Return demo images for showcase with inline SVG data URIs
        const demoImages: ImagingImage[] = [
          {
            id: `${orderId}-img-1`,
            imagingOrderId: orderId,
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InJldGluYSIgY3g9IjUwJSIgY3k9IjQ1JSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRThCNiIvPjxzdG9wIG9mZnNldD0iMjUlIiBzdG9wLWNvbG9yPSIjRkZDNTg2Ii8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNGRjk4NTAiLz48c3RvcCBvZmZzZXQ9Ijc1JSIgc3RvcC1jb2xvcj0iI0VFNjYyMyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzk5M0QxQyIvPjwvbGluZWFyR3JhZGllbnQ+PHJhZGlhbEdyYWRpZW50IGlkPSJvcHRpYyI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRjZFMCIvPjxzdG9wIG9mZnNldD0iMzAlIiBzdG9wLWNvbG9yPSIjRkZFOEIyIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZEQTk1Ii8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiMyQTFBMTIiLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjI0MCIgZmlsbD0idXJsKCNyZXRpbmEpIi8+PGNpcmNsZSBjeD0iNTIwIiBjeT0iMzAwIiByPSI5MCIgZmlsbD0idXJsKCNvcHRpYykiLz48Y2lyY2xlIGN4PSI1MjAiIGN5PSIzMDAiIHI9IjM1IiBmaWxsPSIjRkZGMkQyIi8+PHBhdGggZD0iTTUyMCAzMDBRNDgwIDI2MCA0NDAgMjgwIiBzdHJva2U9IiNEQTUyMzAiIHN0cm9rZS13aWR0aD0iNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MjAgMzAwUTQ4MCAzNDAgNDUwIDM3MCIgc3Ryb2tlPSIjREE1MjMwIiBzdHJva2Utd2lkdGg9IjQuNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MjAgMzAwUTU2MCAyODAgNTgwIDI2MCIgc3Ryb2tlPSIjREE1MjMwIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNTIwIDMwMFE1NTAgMzQwIDU3MCAzNjAiIHN0cm9rZT0iI0RBNTIzMCIgc3Ryb2tlLXdpZHRoPSIzLjUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNDQwIDI4MFE0MDAgMjYwIDM2MCAyNTAiIHN0cm9rZT0iI0NDNDUyMyIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTQ1MCAzNzBRNDIwIDQyMCAzODAgNDUwIiBzdHJva2U9IiNDQzQ1MjMiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTU4MCAyNjBRNjIwIDI0MCA2NTAgMjMwIiBzdHJva2U9IiNDQzQ1MjMiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTU3MCAzNjBRNjAwIDM5MCA2MzAgNDEwIiBzdHJva2U9IiNDQzQ1MjMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjM0MCIgY3k9IjI4MCIgcj0iMiIgZmlsbD0iI0E4MzUyMCIvPjxjaXJjbGUgY3g9IjM3MCIgY3k9IjQzMCIgcj0iMS41IiBmaWxsPSIjQTgzNTIwIi8+PGNpcmNsZSBjeD0iNjMwIiBjeT0iMjYwIiByPSIxLjUiIGZpbGw9IiNBODM1MjAiLz48Y2lyY2xlIGN4PSI2NDUiIGN5PSIzOTAiIHI9IjEuNSIgZmlsbD0iI0E4MzUyMCIvPjx0ZXh0IHg9IjQwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMCIgZmlsbD0iI0FBQUFBQSI+RlVORFVTIFBIT1RPR1JBUEhZIOKAkyBDRU5UUkFMIE1BQ1VMQTwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNTYwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjkiIGZpbGw9IiM4ODg4ODgiPk9EOiBSaWdodCBFeWUgfCBNYWN1bGEtY2VudGVyZWQgfCA1MOKAsCBGT1Y8L3RleHQ+PC9zdmc+',
            thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InIiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkU4QjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFRTY2MjMiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJBMUExMiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNzAiIGZpbGw9InVybCgjcikiLz48Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMDAiIHI9IjIwIiBmaWxsPSIjRkZGMkQyIi8+PHRleHQgeD0iMTAwIiB5PSIxODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0FBQUFBQSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RnVuZHVzPC90ZXh0Pjwvc3ZnPg==',
            fileName: 'fundus_retina_od_001.jpg',
            fileSize: 348422,
            contentType: 'image/jpeg',
            width: 800,
            height: 600,
            modality: 'fundus',
            uploadedAt: new Date().toISOString(),
            annotations: []
          },
          {
            id: `${orderId}-img-2`,
            imagingOrderId: orderId,
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI0YwRjBGMCIvPjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjY4MCIgaGVpZ2h0PSI0ODAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNDAwIiB5PSI5NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMDAwMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+SU9MIFBvd2VyIENhbGN1bGF0aW9uPC90ZXh0PjxyZWN0IHg9IjEwMCIgeT0iMTMwIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjODg4ODg4IiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMTAwIiB5MT0iMTYwIiB4Mj0iNzAwIiB5Mj0iMTYwIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSIzNTAiIHkxPSIxMzAiIHgyPSIzNTAiIHkyPSIzODAiIHN0cm9rZT0iIzg4ODg4OCIgc3Ryb2tlLXdpZHRoPSIxIi8+PGxpbmUgeDE9IjU1MCIgeTE9IjEzMCIgeDI9IjU1MCIgeTI9IjM4MCIgc3Ryb2tlPSIjODg4ODg4IiBzdHJva2Utd2lkdGg9IjEiLz48ZyBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMTExMTExIj48dGV4dCB4PSIxMjAiIHk9IjE1MCI+UGFyYW1ldGVyPC90ZXh0Pjx0ZXh0IHg9IjM3MCIgeT0iMTUwIj5PRC90ZXh0Pjx0ZXh0IHg9IjU3MCIgeT0iMTUwIj5PUzwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjE4MCI+QXggTGVuZ3RoPC90ZXh0Pjx0ZXh0IHg9IjM3MCIgeT0iMTgwIj4yMi4yMCBtbTwvdGV4dD48dGV4dCB4PSI1NzAiIHk9IjE4MCI+MjIuMzggbW08L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyMTAiPksxPC90ZXh0Pjx0ZXh0IHg9IjM3MCIgeT0iMjEwIj40NC41MSBELTJ0ZXh0Pjx0ZXh0IHg9IjU3MCIgeT0iMjEwIj40NS4zOCBEPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMjQwIj5LMjwvdGV4dD48dGV4dCB4PSIzNzAiIHk9IjI0MCI+NDUuNTMgRDwvdGV4dD48dGV4dCB4PSI1NzAiIHk9IjI0MCI+NDYuMTIgRDwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjI3MCI+VGFyZ2V0IFJ4PC90ZXh0Pjx0ZXh0IHg9IjM3MCIgeT0iMjcwIj4rMC4wMCBEPC90ZXh0Pjx0ZXh0IHg9IjU3MCIgeT0iMjcwIj4rMC4wMCBEPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMzAwIj5JT0wgUG93ZXI8L3RleHQ+PHRleHQgeD0iMzcwIiB5PSIzMDAiPisyNC4wMDwvdGV4dD48dGV4dCB4PSI1NzAiIHk9IjMwMCI+KzIzLjUwPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMzMwIj5BQ0Q8L3RleHQ+PHRleHQgeD0iMzcwIiB5PSIzMzAiPjIuODYgbW08L3RleHQ+PHRleHQgeD0iNTcwIiB5PSIzMzAiPjMuMDMgbW08L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIzNjAiPkxUPC90ZXh0Pjx0ZXh0IHg9IjM3MCIgeT0iMzYwIj40LjUwIG1tPC90ZXh0Pjx0ZXh0IHg9IjU3MCIgeT0iMzYwIj40LjM4IG1tPC90ZXh0PjwvZz48cmVjdCB4PSIxMDAiIHk9IjQwMCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI4MCIgZmlsbD0iI0Y4RjhGOCIgc3Ryb2tlPSIjODg4ODg4IiBzdHJva2Utd2lkdGg9IjEiLz48dGV4dCB4PSI0MDAiIHk9IjQyNSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzAwMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rm9ybXVsYTogQmFycmV0dCBVbml2ZXJzYWwgSUkgVEs8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSI0NDUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMwMDAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFjb24gLSBBbGNvbnZhdiBBY3J5U29mIMKuIElRPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iNDY1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMDAwMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Kb2huc29uICZhbXA7IEpvaG5zb24gLSBUZWNuaXMgWkNUPC90ZXh0Pjx0ZXh0IHg9IjgwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI5IiBmaWxsPSIjNjY2NjY2Ij5QYXRpZW50OiBKb2huIERvZSB8IERPQDI0LTA2LTE5ODUgfCBJRDogMTIzNDU8L3RleHQ+PHRleHQgeD0iODAiIHk9IjU2MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI5IiBmaWxsPSIjNjY2NjY2Ij5EYXRlOiAyMC0wMS0yMDI1IHwgWkVJU1MgSU9MTWFzdGVyIDcwMDwvdGV4dD48L3N2Zz4=',
            thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0YwRjBGMCIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTAwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+SU9MPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QXggTGVuZ3RoPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjgiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPksxLEsyLEFDRDwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjMzMzMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qb3dlcjwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BLVNjYW48L3RleHQ+PC9zdmc+',
            fileName: 'iol_ascan_biometry_002.jpg',
            fileSize: 265412,
            contentType: 'image/jpeg',
            width: 800,
            height: 600,
            modality: 'ascan',
            uploadedAt: new Date().toISOString(),
            annotations: []
          },
          {
            id: `${orderId}-img-3`,
            imagingOrderId: orderId,
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik01MCA0MDBRMTUwIDM1MCAyNTAgMzYwUTM1MCAzNzAgNDUwIDM2MFE1NTAgMzUwIDY1MCAzODVRNzUwIDQyMCA4MDAgNDUwIiBzdHJva2U9IiM0NDQ0NDQiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCAzODBRMTUwIDMyMCAyNTAgMzI1UTM1MCAzMzAgNDUwIDMzMFE1NTAgMzMwIDY1MCAzNjBRNzUwIDM5MCA4MDAgNDIwIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCAzNjBRMTUwIDI5MCAyNTAgMjk1UTM1MCAzMDAgNDUwIDMwNVE1NTAgMzEwIDY1MCAzMzBRNzUwIDM1MCA4MDAgMzgwIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCAzNDBRMTUwIDI3MCAyNTAgMjc1UTM1MCAyODAgNDUwIDI4NVE1NTAgMjkwIDY1MCAzMDVRNzUwIDMyMCA4MDAgMzUwIiBzdHJva2U9IiNBQUFBQUEiIHN0cm9rZS13aWR0aD0iNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCAzMjBRMTUwIDI1MCAyNTAgMjU1UTM1MCAyNjAgNDUwIDI2OFE1NTAgMjc1IDY1MCAyODVRNzUwIDI5NSA4MDAgMzIwIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCAzMDBRMTUwIDIzNSAyNTAgMjQwUTM1MCAyNDUgNDUwIDI1NVE1NTAgMjY1IDY1MCAyNzBRNzUwIDI3NSA4MDAgMjk1IiBzdHJva2U9IiNFRUVFRUUiIHN0cm9rZS13aWR0aD0iNyIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCAyODBRMTUwIDIyMCAyNTAgMjI1UTM1MCAyMzAgNDUwIDI0MFE1NTAgMjUwIDY1MCAyNTBRNzUwIDI1MCA4MDAgMjcwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCA0MzBRMTUwIDQwMCAyNTAgNDEwUTM1MCA0MjAgNDUwIDQxMFE1NTAgNDAwIDY1MCA0MjBRNzUwIDQ0MCA4MDAgNDcwIiBzdHJva2U9IiMyMjIyMjIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjxyZWN0IHg9IjMwIiB5PSIyMCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzExMTExMSIgc3Ryb2tlPSIjNDQ0NDQ0IiBzdHJva2Utd2lkdGg9IjEiLz48dGV4dCB4PSI0MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzg4ODg4OCI+T0NUIFJFVElOQTwvdGV4dD48dGV4dCB4PSI0MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzg4ODg4OCI+M0QgOXg5IG1tPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSI3MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjODg4ODg4Ij4yNTYgeMKgMjU2PC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSI4NSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjODg4ODg4Ij4xMjggQi1TY2FuczwvdGV4dD48bGluZSB4MT0iMzgiIHkxPSI0NTAiIHgyPSI3NjAiIHkyPSI0NTAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PGxpbmUgeDE9IjM4IiB5MT0iMjgwIiB4Mj0iMzgiIHkyPSI0NzAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iMTAiIHk9IjM2NSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjNjY2NjY2Ij4wIMK1bTwvdGV4dD48dGV4dCB4PSI3NDAiIHk9IjU4MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjNjY2NjY2Ij5STFMgSW1hZ2VyPC90ZXh0Pjwvc3ZnPg==',
            thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik0yMCAxMjBRNjAgMTAwIDEwMCAxMDVRMTQwIDExMCAxODAgMTI1IiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0yMCAxMDBRNjAgODAgMTAwIDg1UTE0MCA5MCAxODAgMTA1IiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0yMCA4MFE2MCA2NSAxMDAgNzBRMTQwIDc1IDE4MCA4NSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjYiIGZpbGw9Im5vbmUiLz48dGV4dCB4PSIxMDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjODg4ODg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5PQ1Q8L3RleHQ+PC9zdmc+',
            fileName: 'oct_macula_od_003.jpg',
            fileSize: 412789,
            contentType: 'image/jpeg',
            width: 800,
            height: 600,
            modality: 'oct',
            uploadedAt: new Date().toISOString(),
            annotations: []
          },
          {
            id: `${orderId}-img-3`,
            imagingOrderId: orderId,
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI0YyRjJGMiIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjM1MCIgaGVpZ2h0PSI1MjAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0NDQ0NDQyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMjE1IiBjeT0iMzAwIiByPSIxMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0FBQUFBQSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48bGluZSB4MT0iMjE1IiB5MT0iMTgwIiB4Mj0iMjE1IiB5Mj0iNDIwIiBzdHJva2U9IiNBQUFBQ0EiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iNSw1Ii8+PGxpbmUgeDE9Ijk1IiB5MT0iMzAwIiB4Mj0iMzM1IiB5Mj0iMzAwIiBzdHJva2U9IiNBQUFBQUEiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iNSw1Ii8+PGcgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjMzMzMzMzIj48dGV4dCB4PSI3MCIgeT0iMTIwIj4zMTwvdGV4dD48dGV4dCB4PSI5MCIgeT0iMTQwIj4zMDwvdGV4dD48dGV4dCB4PSIxMTAiIHk9IjE2MCI+Mjk8L3RleHQ+PHRleHQgeD0iMTMwIiB5PSIxODAiPjI5PC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMjAwIj4zMDwvdGV4dD48dGV4dCB4PSIxNzAiIHk9IjIyMCI+MzE8L3RleHQ+PHRleHQgeD0iMTkwIiB5PSIyNDAiPjMwPC90ZXh0Pjx0ZXh0IHg9IjIxMCIgeT0iMjYwIj4yOTwvdGV4dD48dGV4dCB4PSIyMzAiIHk9IjI4MCI+MzA8L3RleHQ+PHRleHQgeD0iMjUwIiB5PSIzMDAiPjMxPC90ZXh0Pjx0ZXh0IHg9IjI3MCIgeT0iMzIwIj4zMDwvdGV4dD48dGV4dCB4PSIyOTAiIHk9IjM0MCI+Mjk8L3RleHQ+PHRleHQgeD0iMzEwIiB5PSIzNjAiPjI4PC90ZXh0Pjx0ZXh0IHg9IjE0MCIgeT0iMzYwIj4yNzwvdGV4dD48dGV4dCB4PSIxNjAiIHk9IjM4MCI+Mjg8L3RleHQ+PHRleHQgeD0iMTgwIiB5PSI0MDAiPjI5PC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iNDIwIj4zMDwvdGV4dD48dGV4dCB4PSIyMjAiIHk9IjQ0MCI+Mjk8L3RleHQ+PHRleHQgeD0iMjQwIiB5PSI0NjAiPjI4PC90ZXh0PjwvZz48cmVjdCB4PSI0MjAiIHk9IjE0MCIgd2lkdGg9IjM0MCIgaGVpZ2h0PSIzMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0NDQ0NDQyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBj@0PSI1OTAiIGN5PSIzMDAiIHI9IjEyMCIgZmlsbD0iI0VFRUVFRSIvPjxjaXJjbGUgY3g9IjU5MCIgY3k9IjMwMCIgcj0iOTUiIGZpbGw9IiNEREREREQiLz48Y2lyY2xlIGN4PSI1OTAiIGN5PSIzMDAiIHI9IjY1IiBmaWxsPSIjQ0NDQ0NDIi8+PGNpcmNsZSBjeD0iNTkwIiBjeT0iMzAwIiByPSIzNSIgZmlsbD0iIzk5OTk5OSIvPjxyZWN0IHg9IjQyMCIgeT0iNDgwIiB3aWR0aD0iMzQwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNDQ0NDQ0MiIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNTkwIiB5PSI1MTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzMzMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlZGSTogOTUlIHwgTUQ6IC0yLjUgZEI8L3RleHQ+PHRleHQgeD0iNTkwIiB5PSI1MzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UFNEO2IAMi44IGRCIHwgMjQtMiBTSVRBPC90ZXh0Pjx0ZXh0IHg9IjU5MCIgeT0iNTQ4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJpZ2h0IEV5ZSAoT0QpIHwgTm9ybWFsPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIzMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzIyMjIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiPlZJU1VBTCBGSUVMRCBURVNUIC0gSFVNUEhSRVk8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjU4MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjOTk5OTk5Ij5IZXJ0ZWwtaFVGRiB8IDI0LTIgU0lUQSBTdGFuZGFyZDwvdGV4dD48L3N2Zz4=',
            thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0YyRjJGMiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNjAiIGZpbGw9IiNFRUVFRUUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQ1IiBmaWxsPSIjREREREREIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIzMCIgZmlsbD0iI0NDQ0NDQyIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTUiIGZpbGw9IiM5OTk5OTkiLz48dGV4dCB4PSIxMDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IVkY8L3RleHQ+PC9zdmc+',
            fileName: 'hvf_visual_field_od_004.jpg',
            fileSize: 286432,
            contentType: 'image/jpeg',
            width: 800,
            height: 600,
            modality: 'visual_field',
            uploadedAt: new Date().toISOString(),
            annotations: []
          },
          {
            id: `${orderId}-img-5`,
            imagingOrderId: orderId,
            imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImJzY2FuIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIi8+PHN0b3Agb2Zmc2V0PSIyNSUiIHN0b3AtY29sb3I9IiNFRUVFRUUiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0NDQ0NDQyIvPjxzdG9wIG9mZnNldD0iNzUlIiBzdG9wLWNvbG9yPSIjODg4ODg4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzMzMzMzIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiMwMDAwMDAiLz48cGF0aCBkPSJNNDAwIDEwMEw2NTAgNDUwTC0xNTAgNDUwWiIgZmlsbD0idXJsKCNic2NhbikiIG9wYWNpdHk9IjAuOCIvPjxwYXRoIGQ9Ik00MDAgMTAwTDYwMCA0MDBMNDAwIDQwMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjMiLz48cGF0aCBkPSJNNDAwIDEwMEwyMDAgNDAwTDQwMCA0MDBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4zIi8+PHBhdGggZD0iTTI1MCAyNTBRMzAwIDMwMCAzNTAgMzIwUTQwMCAzNDAgNDUwIDM1MFE1MDAgMzYwIDU1MCAzODAiIHN0cm9rZT0iI0FBQUFBQSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTI4MCAzMDBRMzMwIDMyMCAzODAgMzMwUTQzMCAzNDAgNDgwIDM1MCIgc3Ryb2tlPSIjODg4ODg4IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48ZWxsaXBzZSBjeD0iMzYwIiBjeT0iMzQwIiByeD0iMzAiIHJ5PSIyMCIgZmlsbD0iIzY2NjY2NiIgb3BhY2l0eT0iMC42Ii8+PGVsbGlwc2UgY3g9IjQ4MCIgY3k9IjM1MCIgcng9IjI1IiByeT0iMTgiIGZpbGw9IiM1NTU1NTUiIG9wYWNpdHk9IjAuNSIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxMTExMTEiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNjAiIHk9IjcwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjQUFBQUFBIj5CLVNDQU4gVUxUUkFTT1VORDwvdGV4dD48dGV4dCB4PSI2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzg4ODg4OCI+QVhJQUwgTEVOR1RIOiAyNC4zIG1tPC90ZXh0Pjx0ZXh0IHg9IjYwIiB5PSIxMDUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzg4ODg4OCI+VklUUkVPVVM6IENMRUFSLZ0ZXh0Pjx0ZXh0IHg9IjYwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzg4ODg4OCI+UkVUSU5BOiBBVFRBQ0hFRDwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjU3MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjNjY2NjY2Ij4xMCBNSHogfCBHYWluOiA3MCBkQjwvdGV4dD48L3N2Zz4=',
            thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImIiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzMzMzMzMiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik0xMDAgMzBMMTYwIDE1MEw0MCAxNTBaIiBmaWxsPSJ1cmwoI2IpIiBvcGFjaXR5PSIwLjgiLz48dGV4dCB4PSIxMDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjODg4ODg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CLVNjYW48L3RleHQ+PC9zdmc+',
            fileName: 'bscan_ultrasound_005.jpg',
            fileSize: 196834,
            contentType: 'image/jpeg',
            width: 800,
            height: 600,
            modality: 'ultrasound',
            uploadedAt: new Date().toISOString(),
            annotations: []
          }
        ];
        
        setImages(demoImages);
        setLoading(false);
        return;
      }

      const api = (await import('@/lib/api')).getApi();
      const response = await api.get<ImagingImage[]>(`/Imaging/${orderId}/images`);
      setImages(response.data);
    } catch (err: any) {
      console.error('Failed to fetch images:', err);
      
      // Fallback to demo data on error
      const fallbackImages: ImagingImage[] = [
        {
          id: `${orderId}-fallback-1`,
          imagingOrderId: orderId,
          imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InJldGluYSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRThCNiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0VFNjYyMyIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMkExQTEyIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMzAwIiByPSIyMDAiIGZpbGw9InVybCgjcmV0aW5hKSIvPjxjaXJjbGUgY3g9IjQ4MCIgY3k9IjMwMCIgcj0iNjAiIGZpbGw9IiNGRkYyRDIiLz48cGF0aCBkPSJNNDgwIDMwMFE0NDAgMjcwIDQxMCAyOTAiIHN0cm9rZT0iI0RBNTIzMCIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTQ4MCAzMDBRNDQwIDMzMCA0MjAgMzUwIiBzdHJva2U9IiNEQTUyMzAiIHN0cm9rZS13aWR0aD0iMy41IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTQ4MCAzMDBRNTEwIDI4MCA1MzAgMjYwIiBzdHJva2U9IiNEQTUyMzAiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjxyZWN0IHg9IjI1MCIgeT0iMjAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjciLz48dGV4dCB4PSI0MDAiIHk9IjIzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZW1vIEZ1bmR1cyBQaG90bzwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBvcGFjaXR5PSIwLjgiPkJhY2tlbmQgQVBJIFVuYXZhaWxhYmxlPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSI1NzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzg4ODg4OCI+RmFsbGJhY2sgTW9kZSB8IFJldGluYSBDZW50ZXIgfCBGdW5kdXMgUGhvdG88L3RleHQ+PC9zdmc+',
          thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InIiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkU4QjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFRTY2MjMiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJBMUExMiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNjAiIGZpbGw9InVybCgjcikiLz48dGV4dCB4PSIxMDAiIHk9IjE3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjQUFBQUFBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZW1vPC90ZXh0Pjwvc3ZnPg==',
          fileName: 'demo_fundus_photo.jpg',
          fileSize: 332100,
          contentType: 'image/jpeg',
          width: 800,
          height: 600,
          modality: 'fundus',
          uploadedAt: new Date().toISOString(),
          annotations: []
        }
      ];
      
      setImages(fallbackImages);
      setError('Using demo images - Backend API not available');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: ImagingImage) => {
    setSelectedImage(image);
    setShowLightbox(true);
    onImageSelect?.(image);
  };

  const handleDownload = async (image: ImagingImage, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download image');
    }
  };

  const handleDelete = async (image: ImagingImage, e: React.MouseEvent) => {
    e.stopPropagation();

    confirmDelete(image.fileName, async () => {
      const api = (await import('@/lib/api')).getApi();
      await api.delete(`/Imaging/images/${image.id}`);

      // Remove from local state
      setImages((prev) => prev.filter((img) => img.id !== image.id));

      // Close lightbox if this image was selected
      if (selectedImage?.id === image.id) {
        setShowLightbox(false);
        setSelectedImage(null);
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading images...</span>
      </div>
    );
  }

  if (error && images.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading images</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={fetchImages}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error && images.length > 0) {
    // Show info notification but still display demo images
    // Fall through to render images below
  }

  if (images.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">🖼️</div>
        <p className="text-gray-600 font-medium">No images uploaded yet</p>
        <p className="text-gray-500 text-sm mt-1">Upload images to view them here</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmationComponent />
      {/* Show info banner if using demo/fallback data */}
      {error && images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-sm">ℹ️ {error}</p>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={image.thumbnailUrl || image.imageUrl}
                alt={image.fileName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(image);
                  }}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                  title="View"
                >
                  <span className="text-lg">👁️</span>
                </button>
                <button
                  onClick={(e) => handleDownload(image, e)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => handleDelete(image, e)}
                  className="p-2 bg-white rounded-full hover:bg-red-100 transition"
                  title="Delete"
                >
                  <span className="text-base">❌</span>
                </button>
              </div>

              {/* Annotation count badge */}
              {image.annotations && image.annotations.length > 0 && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {image.annotations.length}
                </div>
              )}
            </div>

            {/* Image Info */}
            <div className="p-2">
              {/* Modality badge */}
              <div className="mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${modalityColors[image.modality] || modalityColors.otros}`}>
                  {modalityLabels[image.modality] || 'Other'}
                </span>
              </div>
              
              {/* File name */}
              <p className="text-xs font-medium text-gray-900 truncate" title={image.fileName}>
                {image.fileName}
              </p>
              
              {/* Meta info */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">{formatFileSize(image.fileSize)}</span>
                {image.width && image.height && (
                  <span className="text-xs text-gray-500">{image.width}×{image.height}</span>
                )}
              </div>
              
              {/* Upload date */}
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{formatDate(image.uploadedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div 
            className="max-w-5xl w-full bg-white rounded-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{selectedImage.fileName}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${modalityColors[selectedImage.modality] || modalityColors.otros}`}>
                    {modalityLabels[selectedImage.modality] || 'Other'}
                  </span>
                  <span className="text-sm text-gray-500">{formatFileSize(selectedImage.fileSize)}</span>
                  {selectedImage.width && selectedImage.height && (
                    <span className="text-sm text-gray-500">{selectedImage.width}×{selectedImage.height}</span>
                  )}
                  <span className="text-sm text-gray-500">{formatDate(selectedImage.uploadedAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleDownload(selectedImage, e)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Image Viewer */}
            <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.fileName}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Annotations Info (if any) */}
            {selectedImage.annotations && selectedImage.annotations.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">
                  Annotations ({selectedImage.annotations.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedImage.annotations.map((annotation) => (
                    <div key={annotation.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="font-medium">{annotation.toolName}</span>
                      {annotation.measurementValue && (
                        <span className="text-blue-600">
                          {annotation.measurementValue} {annotation.measurementUnit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
