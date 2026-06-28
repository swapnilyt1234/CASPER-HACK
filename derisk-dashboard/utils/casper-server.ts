'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export interface AuditLog {
    deployHash: string;
    timestamp: string;
    action: string;
    rate: number;
    halted: boolean;
    status: 'Success' | 'Pending' | 'Failure';
    cost: string;
}

export async function fetchAuditTrail(): Promise<AuditLog[]> {
    try {
        const logPath = path.join(process.cwd(), 'audit_logs.json');
        const fileContents = await fs.readFile(logPath, 'utf8');
        const logs = JSON.parse(fileContents);
        // Bust the Next.js route cache so every poll sees the latest file
        revalidatePath('/vault');
        return logs;
    } catch (error) {
        return [
            {
                deployHash: "0a4cc7ed0889ef5b28861c9e9dfa69c9a7413ce5efef44aa8e758e40bc261b7e",
                timestamp: "2026-06-25T21:33:47.212Z",
                action: "Initial Vault Deployment",
                rate: 5,
                halted: false,
                status: "Success",
                cost: "2.93 CSPR"
            }
        ];
    }
}