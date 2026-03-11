"use client";

import { useState, useRef } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const [error, setError] = useState<string>('');
    const scannerRef = useRef<HTMLDivElement>(null);

    const startScanner = () => {
        if (!scannerRef.current) return;

        Quagga.init({
            inputStream: {
                type: "LiveStream",
                target: scannerRef.current,
                constraints: {
                    width: 480,
                    height: 320,
                    facingMode: "environment"
                },
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "code_128_reader"]
            }
        }, (err: unknown) => {
            if (err) {
                setError("Camera access denied or unavailable.");
                console.error(err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((result: { codeResult?: { code?: string | null } }) => {
            if (result?.codeResult?.code) {
                Quagga.stop();
                onScan(result.codeResult.code);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-border flex justify-between items-center bg-elevated">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" /> Scan Barcode
                    </h3>
                    <button onClick={() => { Quagga.stop(); onClose(); }} className="text-muted-foreground hover:text-danger">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 flex flex-col items-center">
                    {error ? (
                        <div className="text-danger text-sm p-4 bg-danger/10 rounded-lg border border-danger/20 w-full text-center">
                            {error}
                        </div>
                    ) : (
                        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-border border-dashed flex items-center justify-center">
                            <div ref={scannerRef} className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />
                            <button
                                onClick={startScanner}
                                className="absolute inset-0 m-auto w-32 h-10 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg"
                                style={{ display: scannerRef.current?.querySelector('video') ? 'none' : 'block' }}
                            >
                                Start Camera
                            </button>
                            {/* Aiming Reticle UX */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-[70%] h-[40%] border-2 border-primary/50 relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        Point camera at the barcode. Ensure good lighting.
                    </p>
                </div>
            </div>
        </div>
    );
}
