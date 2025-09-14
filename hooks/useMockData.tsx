import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { Company, Vehicle, TeamMember, Notification, UserRole, MaterialRequest, Reminder, AdminUser, AdminNotification, LogEntry, LogType, MaintenanceRecord, ProspectAILead, LeadStatus, GrupoEmpresarial } from '../types';

// DATA CONTEXT
interface DataContextType {
    isLoading: boolean;
    companies: Company[];
    vehicles: Vehicle[];
    teamMembers: TeamMember[];
    reminders: Reminder[];
    maintenanceRecords: MaintenanceRecord[];
    deactivatedAdVehicleIds: Set<string>;
    notifications: Notification[];
    materialRequests: MaterialRequest[];
    adminUsers: AdminUser[];
    adminNotifications: AdminNotification[];
    logs: LogEntry[];
    prospectaiLeads: ProspectAILead[];
    gruposEmpresariais: GrupoEmpresarial[];
    updateCompanyStatus: (id: string, isActive: boolean) => Promise<void>;
    addCompany: (companyData: Omit<Company, 'id' | 'isActive' | 'monthlySalesGoal'>, password: string) => Promise<void>;
    updateCompany: (company: Company) => Promise<void>;
    deleteCompany: (id: string) => Promise<void>;
    addVehicle: (vehicle: Omit<Vehicle, 'id'> & { maintenance: MaintenanceRecord[] }) => Promise<void>;
    updateVehicle: (vehicle: Vehicle & { maintenance: MaintenanceRecord[] }) => Promise<void>;
    deleteVehicle: (id: string) => Promise<void>;
    addTeamMember: (teamMember: Omit<TeamMember, 'id' | 'companyId' | 'avatarUrl'>, companyId: string) => Promise<void>;
    updateTeamMember: (teamMember: TeamMember) => Promise<void>;
    deleteTeamMember: (id: string) => Promise<void>;
    addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => Promise<void>;
    updateReminder: (reminder: Reminder) => Promise<void>;
    deleteReminder: (id: string) => Promise<void>;
    markVehicleAsSold: (id: string) => Promise<void>;
    assignSalesperson: (vehicleId: string, salespersonId: string | null) => Promise<void>;
    toggleVehiclePriority: (id: string) => Promise<void>;
    toggleVehicleAdStatus: (id: string) => Promise<void>;
    markAdAsDeactivated: (vehicleId: string) => void;
    addNotification: (message: string, recipientRole: UserRole, userId?: string) => void;
    markNotificationAsRead: (id: string) => void;
    addMaterialRequest: (request: Omit<MaterialRequest, 'id' | 'date' | 'status'>) => void;
    addAdminUser: (user: Omit<AdminUser, 'id'> & { password?: string }) => Promise<void>;
    updateAdminUser: (user: AdminUser) => Promise<void>;
    deleteAdminUser: (id: string) => Promise<void>;
    addAdminNotification: (message: string, type: AdminNotification['type']) => void;
    markAdminNotificationAsRead: (id: string) => void;
    logActivity: (type: LogType, description: string, details?: { companyId?: string; userId?: string; }) => Promise<void>;
    updateUserPassword: (userId: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
    updateAdminPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
    updateGrupoUserPassword: (groupId: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
    updateGrupoUserProfile: (groupId: string, data: { bannerUrl: string; responsiblePhotoUrl: string; }) => Promise<GrupoEmpresarial | null>;
    updateProspectLeadStatus: (leadId: string, status: LeadStatus, details?: Record<string, any>) => Promise<void>;
    addProspectLeadFeedback: (leadId: string, feedbackText: string, images: string[]) => Promise<void>;
    addGrupoEmpresarial: (grupo: Omit<GrupoEmpresarial, 'id' | 'companyIds' | 'createdAt' | 'isActive'>, password: string) => Promise<void>;
    updateGrupoEmpresarial: (grupo: Omit<GrupoEmpresarial, 'companyIds'>) => Promise<void>;
    updateGrupoCompanies: (groupId: string, companyIds: string[]) => Promise<void>;
    updateGrupoEmpresarialStatus: (groupId: string, isActive: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function to convert data URL to a File object
const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) { return null; }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) { return null; }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

// Helper functions to map from DB snake_case to client camelCase
const mapVehicleFromDB = (v: any): Vehicle => ({
    id: v.id,
    companyId: v.company_id,
    brand: v.brand,
    model: v.model,
    category: v.category,
    color: v.color,
    plate: v.plate,
    purchasePrice: v.purchase_price,
    announcedPrice: v.announced_price,
    discount: v.discount,
    entryDate: v.entry_date,
    dailyCost: v.daily_cost,
    saleGoalDays: v.sale_goal_days,
    adCost: v.ad_cost,
    salespersonId: v.salesperson_id,
    imageUrl: v.image_url,
    status: v.status,
    saleDate: v.sale_date,
    description: v.description,
    ipvaDueDate: v.ipva_due_date,
    ipvaCost: v.ipva_cost,
    isPriority: v.is_priority,
    isAdActive: v.is_ad_active,
    modelYear: v.model_year,
    fabricationYear: v.fabrication_year,
    renavam: v.renavam,
    mileage: v.mileage,
    fuelType: v.fuel_type,
    transmission: v.transmission,
    traction: v.traction,
    doors: v.doors,
    occupants: v.occupants,
    chassis: v.chassis,
    history: v.history,
    revisions: v.revisions,
    standardItems: v.standard_items,
    additionalAccessories: v.additional_accessories,
    documentStatus: v.document_status,
});

const mapTeamMemberFromDB = (tm: any): TeamMember => ({
    id: tm.id,
    companyId: tm.company_id,
    name: tm.name,
    email: tm.email,
    phone: tm.phone,
    avatarUrl: tm.avatar_url,
    monthlySalesGoal: tm.monthly_sales_goal,
    role: tm.role,
    // Note: encrypted_password is not mapped here for security.
    // It should only be fetched during login.
});

const mapProspectFromDB = (p: any): ProspectAILead => ({
    id: p.id,
    createdAt: p.created_at,
    companyId: p.company_id,
    salespersonId: p.salesperson_id,
    leadName: p.lead_name,
    leadPhone: p.lead_phone,
    interestVehicle: p.interest_vehicle,
    status: p.status,
    rawLeadData: p.raw_lead_data,
    details: p.details,
    appointment_at: p.appointment_at,
    feedback: p.feedback,
    prospected_at: p.prospected_at,
    last_feedback_at: p.last_feedback_at,
});

const mapGrupoFromDB = (g: any): GrupoEmpresarial => ({
    id: g.id,
    name: g.name,
    bannerUrl: g.banner_url,
    responsibleName: g.responsible_name,
    responsiblePhotoUrl: g.responsible_photo_url,
    accessEmail: g.access_email,
    phone: g.phone,
    birthDate: g.birth_date,
    companyIds: g.company_ids || [],
    createdAt: g.created_at,
    isActive: g.is_active === null ? true : g.is_active,
});

const mapTeamMemberToDB = (tm: TeamMember) => ({
    name: tm.name,
    email: tm.email,
    phone: tm.phone,
    avatar_url: tm.avatarUrl,
    monthly_sales_goal: tm.monthlySalesGoal,
    role: tm.role,
});


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [prospectaiLeads, setProspectaiLeads] = useState<ProspectAILead[]>([]);
    const [gruposEmpresariais, setGruposEmpresariais] = useState<GrupoEmpresarial[]>([]);

    // Client-side only state for now
    const [deactivatedAdVehicleIds, setDeactivatedAdVehicleIds] = useState<Set<string>>(new Set());
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

    const addAdminNotification = (message: string, type: AdminNotification['type']) => {
        const newNotification: AdminNotification = {
            id: crypto.randomUUID(),
            message,
            type,
            date: new Date().toISOString(),
            read: false
        };
        setAdminNotifications(prev => [newNotification, ...prev]);
    };

    const markAdminNotificationAsRead = (id: string) => {
        setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [
                    { data: companiesData, error: companiesError },
                    // IMPORTANT: We explicitly list columns to avoid fetching the password.
                    { data: teamMembersData, error: teamMembersError },
                    { data: vehiclesData, error: vehiclesError },
                    { data: maintenanceData, error: maintenanceError },
                    { data: remindersData, error: remindersError },
                    { data: logsData, error: logsError },
                    { data: adminUsersData, error: adminUsersError },
                    { data: prospectaiData, error: prospectaiError },
                    { data: gruposData, error: gruposError }
                ] = await Promise.all([
                    supabase.from('companies').select('*').order('created_at', { ascending: true }),
                    supabase.from('team_members').select('id, company_id, name, email, phone, avatar_url, monthly_sales_goal, role'),
                    supabase.from('vehicles').select('*'),
                    supabase.from('maintenance_records').select('*'),
                    supabase.from('reminders').select('*'),
                    supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(200),
                    supabase.from('admin_users').select('id, name, email'),
                    supabase.from('prospectai').select('*').order('created_at', { ascending: false }),
                    supabase.from('grupos_empresariais').select('*').order('created_at', { ascending: true })
                ]);

                if (companiesError) throw companiesError;
                if (teamMembersError) throw teamMembersError;
                if (vehiclesError) throw vehiclesError;
                if (maintenanceError) throw maintenanceError;
                if (remindersError) throw remindersError;
                if (logsError) throw logsError;
                if (adminUsersError) throw adminUsersError;
                if (prospectaiError) throw prospectaiError;
                if (gruposError) throw gruposError;
                
                // MAP DB snake_case to client camelCase
                const mappedCompanies: Company[] = (companiesData || []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    isActive: c.is_active,
                    logoUrl: c.logo_url,
                    cnpj: c.cnpj,
                    phone: c.phone,
                    email: c.email,
                    instagram: c.instagram,
                    ownerName: c.owner_name,
                    ownerPhone: c.owner_phone,
                    ownerEmail: c.owner_email,
                    monthlySalesGoal: c.monthly_sales_goal,
                    monthlyAdBudget: c.monthly_ad_budget,
                    marketingDriveUrl: c.marketing_drive_url,
                    visibleFields: c.visible_fields,
                    enabledFeatures: c.enabled_features || ['estoque_inteligente', 'prospectai', 'marketing'], // Default all for backwards compatibility
                }));

                const mappedTeamMembers: TeamMember[] = (teamMembersData || []).map(mapTeamMemberFromDB);
                const mappedVehicles: Vehicle[] = (vehiclesData || []).map(mapVehicleFromDB);
                const mappedMaintenance: MaintenanceRecord[] = (maintenanceData || []).map((m: any) => ({
                    id: m.id,
                    vehicleId: m.vehicle_id,
                    description: m.description,
                    cost: m.cost,
                    date: m.date,
                    invoiceUrl: m.invoice_url
                }));
                const mappedProspects: ProspectAILead[] = (prospectaiData || []).map(mapProspectFromDB);
                const mappedGrupos: GrupoEmpresarial[] = (gruposData || []).map(mapGrupoFromDB);

                const enrichedVehicles = mappedVehicles.map(vehicle => ({
                    ...vehicle,
                    maintenance: mappedMaintenance.filter(mr => mr.vehicleId === vehicle.id),
                }));

                setCompanies(mappedCompanies || []);
                setTeamMembers(mappedTeamMembers || []);
                setVehicles(enrichedVehicles);
                setMaintenanceRecords(mappedMaintenance || []);
                setReminders(remindersData || []);
                setAdminUsers(adminUsersData || []);
                setProspectaiLeads(mappedProspects || []);
                setGruposEmpresariais(mappedGrupos || []);
                
                const enrichedLogs = (logsData || []).map((log: any) => ({
                    ...log,
                    companyName: (mappedCompanies || []).find(c => c.id === log.company_id)?.name,
                    userName: (mappedTeamMembers || []).find((tm: any) => tm.id === log.user_id)?.name,
                }));
                setLogs(enrichedLogs);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const logActivity = async (type: LogType, description: string, details: { companyId?: string, userId?: string } = {}) => {
        const company = companies.find(c => c.id === details.companyId);
        const user = teamMembers.find(tm => tm.id === details.userId);

        const newLog = {
            type,
            description,
            company_id: company?.id,
            user_id: user?.id,
        };

        const { data, error } = await supabase.from('logs').insert(newLog).select();
        
        if (error) {
            console.error("Error logging activity:", error);
            return;
        }
        
        if (!data || data.length === 0) return;

        const enrichedLog: LogEntry = {
            ...data[0],
            companyName: company?.name,
            userName: user?.name
        };

        setLogs(prev => [enrichedLog, ...prev]);
    };

    const updateCompanyStatus = async (id: string, isActive: boolean) => {
        const company = companies.find(c => c.id === id);
        if (!company) return;

        // Store original state for potential rollback
        const originalCompanies = [...companies];
        
        // Optimistic UI update
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, isActive } : c));

        const { error } = await supabase.from('companies').update({ is_active: isActive }).eq('id', id);
        
        if (error) {
            console.error("Error updating company status:", error);
            // On error, revert to the original state
            setCompanies(originalCompanies);
            alert("Falha ao atualizar status. Verifique suas permissões de banco de dados (RLS).");
            return; // Stop execution
        }

        // If successful, log activity
        await logActivity(
            isActive ? 'COMPANY_APPROVED' : 'COMPANY_DEACTIVATED',
            `Empresa ${company.name} foi ${isActive ? 'aprovada' : 'desativada'}.`,
            { companyId: id }
        );
    };

    const addCompany = async (companyData: Omit<Company, 'id' | 'isActive' | 'monthlySalesGoal'>, password: string) => {
        // 1. Upload logo if provided
        let finalLogoUrl = companyData.logoUrl;
        if (companyData.logoUrl && companyData.logoUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(companyData.logoUrl, `logo-${Date.now()}`);
            if (file) {
                const filePath = `public/company-logos/${crypto.randomUUID()}`;
                const { error: uploadError } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                if (uploadError) {
                    console.error("Error uploading logo:", uploadError);
                } else {
                    const { data: urlData } = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath);
                    finalLogoUrl = urlData.publicUrl;
                }
            }
        }
        
        // 2. Insert company into public.companies table
        const newCompanyData = {
            name: companyData.name,
            logo_url: finalLogoUrl,
            cnpj: companyData.cnpj,
            phone: companyData.phone,
            email: companyData.email,
            instagram: companyData.instagram,
            owner_name: companyData.ownerName,
            owner_phone: companyData.ownerPhone,
            owner_email: companyData.ownerEmail,
            is_active: false,
            monthly_sales_goal: 10,
            enabled_features: companyData.enabledFeatures,
        };

        const { data, error } = await supabase.from('companies').insert(newCompanyData).select().single();
        
        if (error) {
            console.error("Error adding company:", error);
            throw new Error("Não foi possível registrar a empresa no banco de dados.");
        }
        
        const companyId = data.id;

        // 3. Insert the main user (Gestor) into public.team_members
        const newTeamMember = {
            id: crypto.randomUUID(), // Using crypto.randomUUID for new users
            company_id: companyId,
            name: companyData.ownerName || 'Gestor Principal',
            email: companyData.ownerEmail,
            encrypted_password: password, // Storing password directly (as per original logic)
            role: 'Gestor' as const,
            avatar_url: 'https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/molduras/Screenshot%202025-08-25%20182827.png',
        };
        
        const { data: teamMemberData, error: teamMemberError } = await supabase.from('team_members').insert(newTeamMember).select().single();

        if (teamMemberError) {
            console.error("Error adding initial team member:", teamMemberError);
            await supabase.from('companies').delete().eq('id', companyId);
            throw new Error("Não foi possível criar o perfil do gestor.");
        }

        // 4. Update client state
        const addedCompany: Company = {
            id: data.id,
            name: data.name,
            isActive: data.is_active,
            logoUrl: data.logo_url,
            cnpj: data.cnpj,
            phone: data.phone,
            email: data.email,
            ownerEmail: data.owner_email,
            instagram: data.instagram,
            ownerName: data.owner_name,
            ownerPhone: data.owner_phone,
            monthlySalesGoal: data.monthly_sales_goal,
            monthlyAdBudget: data.monthly_ad_budget,
            marketingDriveUrl: data.marketing_drive_url,
            visibleFields: data.visible_fields,
            enabledFeatures: data.enabled_features,
        };
        
        const addedTeamMember = mapTeamMemberFromDB(teamMemberData);
        setTeamMembers(prev => [...prev, addedTeamMember]);
        setCompanies(prev => [...prev, addedCompany]);
        addAdminNotification(`Nova empresa cadastrada: ${addedCompany.name}.`, 'new_company');
        await logActivity('COMPANY_PENDING', `Empresa ${addedCompany.name} cadastrada e aguardando aprovação.`, { companyId: addedCompany.id });
    };

    const updateCompany = async (updatedCompany: Company) => {
        const { id, ...companyData } = updatedCompany;
        let finalLogoUrl = companyData.logoUrl;

        if (companyData.logoUrl && companyData.logoUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(companyData.logoUrl, `logo-${Date.now()}`);
            if (file) {
                const filePath = `public/company-logos/${crypto.randomUUID()}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('estoqueinteligentetriad3')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Error uploading new logo:", uploadError);
                    const oldCompany = companies.find(c => c.id === id);
                    finalLogoUrl = oldCompany ? oldCompany.logoUrl : '';
                } else {
                    const { data: urlData } = supabase.storage
                        .from('estoqueinteligentetriad3')
                        .getPublicUrl(filePath);
                    finalLogoUrl = urlData.publicUrl;
                }
            }
        }
        
        const companyUpdateData = {
            name: companyData.name,
            is_active: companyData.isActive,
            logo_url: finalLogoUrl,
            cnpj: companyData.cnpj,
            phone: companyData.phone,
            email: companyData.email,
            owner_email: companyData.ownerEmail,
            instagram: companyData.instagram,
            owner_name: companyData.ownerName,
            owner_phone: companyData.ownerPhone,
            monthly_sales_goal: companyData.monthlySalesGoal,
            monthly_ad_budget: companyData.monthlyAdBudget,
            marketing_drive_url: companyData.marketingDriveUrl,
            visible_fields: companyData.visibleFields,
            enabled_features: companyData.enabledFeatures,
        };

        const { error } = await supabase.from('companies').update(companyUpdateData).eq('id', id);
        
        if (error) {
            console.error("Error updating company:", error);
            return;
        }
        
        const companyWithFinalLogo = { ...updatedCompany, logoUrl: finalLogoUrl };
        setCompanies(prev => prev.map(c => c.id === id ? companyWithFinalLogo : c));
    };

    const deleteCompany = async (id: string) => {
        const companyToDelete = companies.find(c => c.id === id);
        if(!companyToDelete) return;
        
        // Log the deletion action first to avoid foreign key violation.
        await logActivity('COMPANY_DELETED', `Empresa ${companyToDelete.name} e todos os seus dados foram removidos.`, { companyId: id });
        
        const { error } = await supabase.from('companies').delete().eq('id', id);
        if (error) {
            console.error("Error deleting company:", error);
            // NOTE: A transaction would be ideal here to roll back the log if deletion fails.
            // For now, we accept this potential inconsistency to fix the primary error.
            return;
        }

        setCompanies(prev => prev.filter(c => c.id !== id));
        setTeamMembers(prev => prev.filter(tm => tm.companyId !== id));
        setVehicles(prev => prev.filter(v => v.companyId !== id));
    };

    const addVehicle = async (vehicleData: Omit<Vehicle, 'id'> & { maintenance: MaintenanceRecord[] }) => {
        const { maintenance, ...vehicle } = vehicleData;
        let finalImageUrl = vehicle.imageUrl;

        if (vehicle.imageUrl && vehicle.imageUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(vehicle.imageUrl, `vehicle-${Date.now()}`);
            if (file) {
                const filePath = `public/vehicle-images/${crypto.randomUUID()}`;
                const { error: uploadError } = await supabase.storage
                    .from('estoqueinteligentetriad3')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Error uploading vehicle image:", uploadError);
                    finalImageUrl = '';
                } else {
                    const { data: urlData } = supabase.storage
                        .from('estoqueinteligentetriad3')
                        .getPublicUrl(filePath);
                    finalImageUrl = urlData.publicUrl;
                }
            }
        }

        const newVehicleData = {
            company_id: vehicle.companyId, brand: vehicle.brand, model: vehicle.model,
            category: vehicle.category, color: vehicle.color, plate: vehicle.plate,
            purchase_price: vehicle.purchasePrice, announced_price: vehicle.announcedPrice,
            discount: vehicle.discount, entry_date: vehicle.entryDate,
            daily_cost: vehicle.dailyCost, sale_goal_days: vehicle.saleGoalDays,
            ad_cost: vehicle.adCost, image_url: finalImageUrl, description: vehicle.description,
            ipva_due_date: vehicle.ipvaDueDate, ipva_cost: vehicle.ipvaCost,
            model_year: vehicle.modelYear, fabrication_year: vehicle.fabricationYear,
            renavam: vehicle.renavam, mileage: vehicle.mileage, fuel_type: vehicle.fuelType,
            transmission: vehicle.transmission, traction: vehicle.traction, doors: vehicle.doors,
            occupants: vehicle.occupants, chassis: vehicle.chassis, history: vehicle.history,
            revisions: vehicle.revisions, standard_items: vehicle.standardItems,
            additional_accessories: vehicle.additionalAccessories, document_status: vehicle.documentStatus,
            is_ad_active: false,
        };

        const { data: vehicleResult, error: vehicleError } = await supabase
            .from('vehicles').insert(newVehicleData).select().single();

        if (vehicleError) return console.error("Error adding vehicle:", vehicleError);

        const newVehicleId = vehicleResult.id;
        let newMaintenanceRecords: MaintenanceRecord[] = [];

        if (maintenance && maintenance.length > 0) {
            const maintenanceToInsert = maintenance.map(m => ({
                vehicle_id: newVehicleId, description: m.description, cost: m.cost,
                date: new Date().toISOString(), invoice_url: m.invoiceUrl,
            }));

            const { data: maintenanceResult, error: maintenanceError } = await supabase
                .from('maintenance_records').insert(maintenanceToInsert).select();
            
            if (maintenanceError) console.error("Error adding maintenance:", maintenanceError);
            else newMaintenanceRecords = (maintenanceResult || []).map((m: any) => ({
                id: m.id, vehicleId: m.vehicle_id, description: m.description,
                cost: m.cost, date: m.date, invoiceUrl: m.invoice_url,
            }));
        }
        
        const addedVehicle = mapVehicleFromDB(vehicleResult);
        addedVehicle.maintenance = newMaintenanceRecords;
        
        setVehicles(prev => [...prev, addedVehicle]);
        setMaintenanceRecords(prev => [...prev, ...newMaintenanceRecords]);
        await logActivity('VEHICLE_CREATED', `Veículo ${addedVehicle.brand} ${addedVehicle.model} cadastrado.`, { companyId: addedVehicle.companyId });
    };

    const updateVehicle = async (vehicleData: Vehicle & { maintenance: MaintenanceRecord[] }) => {
        const { maintenance, id, ...vehicle } = vehicleData;
        let finalImageUrl = vehicle.imageUrl;

        if (vehicle.imageUrl && vehicle.imageUrl.startsWith('data:image/')) {
             const file = dataURLtoFile(vehicle.imageUrl, `vehicle-${Date.now()}`);
            if (file) {
                const filePath = `public/vehicle-images/${crypto.randomUUID()}`;
                const { error: uploadError } = await supabase.storage
                    .from('estoqueinteligentetriad3')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Error uploading vehicle image:", uploadError);
                    const oldVehicle = vehicles.find(v => v.id === id);
                    finalImageUrl = oldVehicle ? oldVehicle.imageUrl : '';
                } else {
                    const { data: urlData } = supabase.storage
                        .from('estoqueinteligentetriad3')
                        .getPublicUrl(filePath);
                    finalImageUrl = urlData.publicUrl;
                }
            }
        }

        const vehicleUpdateData = {
            company_id: vehicle.companyId, brand: vehicle.brand, model: vehicle.model,
            category: vehicle.category, color: vehicle.color, plate: vehicle.plate,
            purchase_price: vehicle.purchasePrice, announced_price: vehicle.announcedPrice,
            discount: vehicle.discount, entry_date: vehicle.entryDate,
            daily_cost: vehicle.dailyCost, sale_goal_days: vehicle.saleGoalDays,
            ad_cost: vehicle.adCost, salesperson_id: vehicle.salespersonId,
            image_url: finalImageUrl, status: vehicle.status, sale_date: vehicle.saleDate,
            description: vehicle.description, ipva_due_date: vehicle.ipvaDueDate,
            ipva_cost: vehicle.ipvaCost, is_priority: vehicle.isPriority,
            is_ad_active: vehicle.isAdActive, model_year: vehicle.modelYear,
            fabrication_year: vehicle.fabricationYear, renavam: vehicle.renavam,
            mileage: vehicle.mileage, fuel_type: vehicle.fuelType,
            transmission: vehicle.transmission, traction: vehicle.traction, doors: vehicle.doors,
            occupants: vehicle.occupants, chassis: vehicle.chassis, history: vehicle.history,
            revisions: vehicle.revisions, standard_items: vehicle.standardItems,
            additional_accessories: vehicle.additionalAccessories,
            document_status: vehicle.documentStatus,
        };

        const { error: vehicleError } = await supabase.from('vehicles').update(vehicleUpdateData).eq('id', id!);
        if (vehicleError) return console.error("Error updating vehicle:", vehicleError);

        const { error: deleteError } = await supabase.from('maintenance_records').delete().eq('vehicle_id', id!);
        if (deleteError) console.error("Error deleting old maintenance:", deleteError);
        
        let newMaintenanceRecords: MaintenanceRecord[] = [];
        if (maintenance && maintenance.length > 0) {
            const maintenanceToInsert = maintenance.map(m => ({
                vehicle_id: id, description: m.description, cost: m.cost,
                date: m.date, invoice_url: m.invoiceUrl,
            }));
            const { data: maintResult, error: insertError } = await supabase.from('maintenance_records').insert(maintenanceToInsert).select();
            if (insertError) console.error("Error inserting new maintenance:", insertError);
            else newMaintenanceRecords = (maintResult || []).map((m: any) => ({
                id: m.id, vehicleId: m.vehicle_id, description: m.description,
                cost: m.cost, date: m.date, invoiceUrl: m.invoice_url
            }));
        }

        const updatedVehicle = { ...vehicleData, imageUrl: finalImageUrl, maintenance: newMaintenanceRecords };
        setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
        setMaintenanceRecords(prev => [...prev.filter(m => m.vehicleId !== id), ...newMaintenanceRecords]);
    };

    const deleteVehicle = async (id: string) => {
        const vehicleToDelete = vehicles.find(v => v.id === id);
        if (!vehicleToDelete) return;

        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) return console.error("Error deleting vehicle:", error);

        setVehicles(prev => prev.filter(v => v.id !== id));
        setMaintenanceRecords(prev => prev.filter(m => m.vehicleId !== id));
        await logActivity('VEHICLE_DELETED', `Veículo ${vehicleToDelete.brand} ${vehicleToDelete.model} removido.`, { companyId: vehicleToDelete.companyId });
    };

    const addTeamMember = async (teamMemberData: Omit<TeamMember, 'id' | 'companyId' | 'avatarUrl'>, companyId: string) => {
        const avatarUrl = 'https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/molduras/Screenshot%202025-08-25%20182827.png';
        const newMemberData = {
            id: crypto.randomUUID(),
            company_id: companyId,
            name: teamMemberData.name,
            email: teamMemberData.email,
            phone: teamMemberData.phone,
            monthly_sales_goal: teamMemberData.monthlySalesGoal,
            role: teamMemberData.role,
            avatar_url: avatarUrl,
            encrypted_password: teamMemberData.encrypted_password,
        };

        const { data, error } = await supabase.from('team_members').insert(newMemberData).select().single();
        if (error) {
            console.error("Error adding team member:", error);
            return;
        }

        const addedMember = mapTeamMemberFromDB(data);
        setTeamMembers(prev => [...prev, addedMember]);
        await logActivity('USER_CREATED', `Novo membro da equipe adicionado: ${addedMember.name}.`, { companyId });
    };

    const updateTeamMember = async (teamMember: TeamMember) => {
        let finalAvatarUrl = teamMember.avatarUrl;

        // Check if a new avatar (base64) was provided and upload it
        if (teamMember.avatarUrl && teamMember.avatarUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(teamMember.avatarUrl, `avatar-${teamMember.id}-${Date.now()}`);
            if (file) {
                const filePath = `public/avatars/${teamMember.id}/${crypto.randomUUID()}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('estoqueinteligentetriad3')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Error uploading new avatar:", uploadError);
                    const oldMember = teamMembers.find(tm => tm.id === teamMember.id);
                    finalAvatarUrl = oldMember ? oldMember.avatarUrl : ''; 
                } else {
                    const { data: urlData } = supabase.storage
                        .from('estoqueinteligentetriad3')
                        .getPublicUrl(filePath);
                    finalAvatarUrl = urlData.publicUrl;
                }
            }
        }

        const teamMemberWithFinalAvatar = { ...teamMember, avatarUrl: finalAvatarUrl };
        const updateData = mapTeamMemberToDB(teamMemberWithFinalAvatar);
        const { error } = await supabase.from('team_members').update(updateData).eq('id', teamMember.id);
        
        if (error) {
            console.error("Error updating team member:", error);
            return;
        }
        
        setTeamMembers(prev => prev.map(tm => tm.id === teamMember.id ? teamMemberWithFinalAvatar : tm));
        await logActivity('USER_UPDATED', `Dados do membro ${teamMember.name} atualizados.`, { companyId: teamMember.companyId, userId: teamMember.id });
    };

    const deleteTeamMember = async (id: string) => {
        const memberToDelete = teamMembers.find(tm => tm.id === id);
        if (!memberToDelete) return;
        
        if (memberToDelete.role === 'Gestor') {
            alert('Não é possível excluir um usuário com o cargo de Gestor.');
            return;
        }

        const { error } = await supabase.from('team_members').delete().eq('id', id);
        if (error) {
            console.error("Error deleting team member:", error);
            return;
        }
        setTeamMembers(prev => prev.filter(tm => tm.id !== id));
        await logActivity('USER_DELETED', `Membro ${memberToDelete.name} foi removido.`, { companyId: memberToDelete.companyId });
    };

    const markVehicleAsSold = async (id: string) => {
        const vehicleToSell = vehicles.find(v => v.id === id);
        if (!vehicleToSell) return;

        const saleDate = new Date().toISOString();
        const { error } = await supabase.from('vehicles').update({ status: 'sold', sale_date: saleDate }).eq('id', id);
        if (error) return console.error("Error marking as sold:", error);

        setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'sold', saleDate } : v));
        await logActivity('VEHICLE_SOLD', `Veículo ${vehicleToSell.brand} ${vehicleToSell.model} vendido.`, { companyId: vehicleToSell.companyId });
    };

    const assignSalesperson = async (vehicleId: string, salespersonId: string | null) => {
        const { error } = await supabase.from('vehicles').update({ salesperson_id: salespersonId }).eq('id', vehicleId);
        if (error) return console.error("Error assigning salesperson:", error);
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, salespersonId: salespersonId || undefined } : v));
    };

    const toggleVehiclePriority = async (id: string) => {
        const vehicle = vehicles.find(v => v.id === id);
        if (!vehicle) return;
        const newPriority = !vehicle.isPriority;
        const { error } = await supabase.from('vehicles').update({ is_priority: newPriority }).eq('id', id);
        if (error) return console.error("Error toggling priority:", error);
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, isPriority: newPriority } : v));
    };

    const toggleVehicleAdStatus = async (id: string) => {
        const vehicle = vehicles.find(v => v.id === id);
        if (!vehicle) return;
        const newAdStatus = !vehicle.isAdActive;
        const { error } = await supabase.from('vehicles').update({ is_ad_active: newAdStatus }).eq('id', id);
        if (error) return console.error("Error toggling ad status:", error);
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, isAdActive: newAdStatus } : v));
    };
    
    const updateUserPassword = async (userId: string, currentPassword: string, newPassword: string) => {
        const { data: user, error: fetchError } = await supabase
            .from('team_members')
            .select('encrypted_password')
            .eq('id', userId)
            .single();

        if (fetchError || !user) {
            return { success: false, message: 'Usuário não encontrado.' };
        }
        if (user.encrypted_password !== currentPassword) {
            return { success: false, message: 'A senha atual está incorreta.' };
        }
        const { error: updateError } = await supabase
            .from('team_members')
            .update({ encrypted_password: newPassword })
            .eq('id', userId);

        if (updateError) {
            return { success: false, message: 'Não foi possível alterar a senha.' };
        }
        return { success: true, message: 'Senha alterada com sucesso!' };
    };

    const updateAdminPassword = async (currentPassword: string, newPassword: string) => {
        const adminUserStr = sessionStorage.getItem('adminUser');
        if (!adminUserStr) {
            return { success: false, message: 'Sessão de administrador inválida.' };
        }
        const adminUser: AdminUser = JSON.parse(adminUserStr);
        const adminId = adminUser.id;

        const { data: user, error: fetchError } = await supabase
            .from('admin_users')
            .select('encrypted_password')
            .eq('id', adminId)
            .single();

        if (fetchError || !user) {
            console.error("Error fetching admin user:", fetchError);
            return { success: false, message: 'Não foi possível verificar o administrador.' };
        }

        if (user.encrypted_password !== currentPassword) {
            return { success: false, message: 'A senha atual está incorreta.' };
        }

        const { data: updatedData, error: updateError } = await supabase
            .from('admin_users')
            .update({ encrypted_password: newPassword })
            .eq('id', adminId)
            .select();

        if (updateError || !updatedData || updatedData.length === 0) {
            console.error("Error updating admin password:", updateError);
            return { success: false, message: 'Ocorreu um erro ao atualizar a senha. Verifique suas permissões ou contate o suporte.' };
        }

        return { success: true, message: 'Senha alterada com sucesso!' };
    };

    const addAdminUser = async (userData: Omit<AdminUser, 'id'> & { password?: string }) => {
        const { data, error } = await supabase.rpc('create_admin_user', {
            new_name: userData.name,
            new_email: userData.email,
            new_password: userData.password,
        });

        if (error) {
            console.error("Error adding admin user:", error);
            return;
        }
        
        // RPCs that return a table/SETOF return an array.
        // The function is designed to return a single row in an array.
        if (data && data.length > 0) {
            const newUser: AdminUser = data[0];
            setAdminUsers(prev => [...prev, newUser]);
        }
    };

    const updateProspectLeadStatus = async (leadId: string, status: LeadStatus, newDetails?: Record<string, any>) => {
        const leadToUpdate = prospectaiLeads.find(l => l.id === leadId);
        if (!leadToUpdate) {
            console.error("Lead to update not found");
            return;
        }

        const updatePayload: {
            status: LeadStatus;
            prospected_at?: string;
            details?: any;
            appointment_at?: string | null;
        } = { status };

        if (status === 'Em Contato' && !leadToUpdate.prospected_at) {
            updatePayload.prospected_at = new Date().toISOString();
        }

        const currentDetails = leadToUpdate.details || {};
        if (currentDetails.appointment_date) {
            delete currentDetails.appointment_date;
        }
        updatePayload.details = currentDetails;

        if (status === 'Agendado' && newDetails?.appointment_date) {
            updatePayload.appointment_at = newDetails.appointment_date;
        } else if (status !== 'Agendado') {
            updatePayload.appointment_at = null;
        }

        if (Object.keys(updatePayload.details).length === 0) {
            updatePayload.details = null;
        }

        const { data: updatedLeadData, error } = await supabase
            .from('prospectai')
            .update(updatePayload)
            .eq('id', leadId)
            .select()
            .single();

        if (error) {
            console.error("Error updating lead status:", error);
            return;
        }

        const mappedUpdatedLead = mapProspectFromDB(updatedLeadData);
        setProspectaiLeads(prev => prev.map(lead =>
            lead.id === leadId ? mappedUpdatedLead : lead
        ));
    };

    const addProspectLeadFeedback = async (leadId: string, feedbackText: string, images: string[]) => {
        try {
            const imageUrls: string[] = [];
            for (const imageBase64 of images) {
                const file = dataURLtoFile(imageBase64, `feedback-${leadId}-${Date.now()}`);
                if (file) {
                    const filePath = `public/feedback-images/${leadId}/${crypto.randomUUID()}`;
                    const { error: uploadError } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                    
                    if (uploadError) {
                        console.error("Error uploading feedback image:", uploadError);
                    } else {
                        const { data: urlData } = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath);
                        imageUrls.push(urlData.publicUrl);
                    }
                }
            }

            const { data: currentLeadData, error: fetchError } = await supabase
                .from('prospectai')
                .select('feedback')
                .eq('id', leadId)
                .single();

            if (fetchError) throw fetchError;

            const currentFeedback = currentLeadData.feedback || [];
            const newFeedback = {
                text: feedbackText,
                images: imageUrls,
                createdAt: new Date().toISOString(),
            };

            const updatedFeedback = [...currentFeedback, newFeedback];
            const updatePayload = {
                feedback: updatedFeedback,
                last_feedback_at: new Date().toISOString(),
            };

            const { data: updatedLeadData, error: updateError } = await supabase
                .from('prospectai')
                .update(updatePayload)
                .eq('id', leadId)
                .select()
                .single();

            if (updateError) throw updateError;
            
            const mappedUpdatedLead = mapProspectFromDB(updatedLeadData);
            setProspectaiLeads(prev => prev.map(l => l.id === leadId ? mappedUpdatedLead : l));

        } catch (error) {
            console.error("Failed to add feedback:", error);
        }
    };
    
    const addGrupoEmpresarial = async (grupoData: Omit<GrupoEmpresarial, 'id' | 'companyIds' | 'createdAt' | 'isActive'>, password: string) => {
        let finalBannerUrl = grupoData.bannerUrl;
        if (grupoData.bannerUrl && grupoData.bannerUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(grupoData.bannerUrl, `banner-${Date.now()}`);
            if (file) {
                const filePath = `public/grupos-empresariais/${crypto.randomUUID()}`;
                const { error } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                if (error) console.error('Error uploading banner:', error);
                else finalBannerUrl = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath).data.publicUrl;
            }
        }

        let finalPhotoUrl = grupoData.responsiblePhotoUrl;
        if (grupoData.responsiblePhotoUrl && grupoData.responsiblePhotoUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(grupoData.responsiblePhotoUrl, `photo-${Date.now()}`);
            if (file) {
                const filePath = `public/grupos-empresariais/${crypto.randomUUID()}`;
                const { error } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                if (error) console.error('Error uploading photo:', error);
                else finalPhotoUrl = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath).data.publicUrl;
            }
        }

        const newGrupo = {
            name: grupoData.name,
            banner_url: finalBannerUrl,
            responsible_name: grupoData.responsibleName,
            responsible_photo_url: finalPhotoUrl,
            access_email: grupoData.accessEmail,
            encrypted_password: password,
            phone: grupoData.phone,
            birth_date: grupoData.birthDate,
            company_ids: [],
            is_active: true,
        };

        const { data, error } = await supabase.from('grupos_empresariais').insert(newGrupo).select().single();
        if (error) return console.error("Error adding grupo:", error);

        const addedGrupo = mapGrupoFromDB(data);
        setGruposEmpresariais(prev => [...prev, addedGrupo]);
    };

    const updateGrupoEmpresarial = async (grupo: Omit<GrupoEmpresarial, 'companyIds'>) => {
        let finalBannerUrl = grupo.bannerUrl;
        if (grupo.bannerUrl && grupo.bannerUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(grupo.bannerUrl, `banner-${grupo.id}-${Date.now()}`);
            if (file) {
                const filePath = `public/grupos-empresariais/${crypto.randomUUID()}`;
                const { error } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                if (error) console.error('Error uploading new banner:', error);
                else finalBannerUrl = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath).data.publicUrl;
            }
        }

        let finalPhotoUrl = grupo.responsiblePhotoUrl;
        if (grupo.responsiblePhotoUrl && grupo.responsiblePhotoUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(grupo.responsiblePhotoUrl, `photo-${grupo.id}-${Date.now()}`);
            if (file) {
                const filePath = `public/grupos-empresariais/${crypto.randomUUID()}`;
                const { error } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                if (error) console.error('Error uploading new photo:', error);
                else finalPhotoUrl = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath).data.publicUrl;
            }
        }

        const updateData = {
            name: grupo.name,
            banner_url: finalBannerUrl,
            responsible_name: grupo.responsibleName,
            responsible_photo_url: finalPhotoUrl,
            access_email: grupo.accessEmail,
            phone: grupo.phone,
            birth_date: grupo.birthDate,
            is_active: grupo.isActive,
        };

        const { error } = await supabase.from('grupos_empresariais').update(updateData).eq('id', grupo.id);
        if (error) return console.error("Error updating grupo:", error);

        const updatedGrupoWithFinalUrls = { ...gruposEmpresariais.find(g => g.id === grupo.id)!, ...grupo, bannerUrl: finalBannerUrl, responsiblePhotoUrl: finalPhotoUrl };
        setGruposEmpresariais(prev => prev.map(g => g.id === grupo.id ? updatedGrupoWithFinalUrls : g));
    };

    const updateGrupoCompanies = async (groupId: string, companyIds: string[]) => {
        const { error } = await supabase.from('grupos_empresariais').update({ company_ids: companyIds }).eq('id', groupId);
        if (error) return console.error("Error updating grupo companies:", error);
        setGruposEmpresariais(prev => prev.map(g => g.id === groupId ? { ...g, companyIds } : g));
    };

    const updateGrupoEmpresarialStatus = async (groupId: string, isActive: boolean) => {
        const { error } = await supabase.from('grupos_empresariais').update({ is_active: isActive }).eq('id', groupId);
        if (error) {
            console.error("Error updating grupo status:", error);
            return;
        }
        setGruposEmpresariais(prev => prev.map(g => g.id === groupId ? { ...g, isActive } : g));
    };

    const updateGrupoUserProfile = async (groupId: string, data: { bannerUrl: string, responsiblePhotoUrl: string }): Promise<GrupoEmpresarial | null> => {
        let finalBannerUrl = data.bannerUrl;
        if (data.bannerUrl && data.bannerUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(data.bannerUrl, `banner-${groupId}-${Date.now()}`);
            if (file) {
                const filePath = `public/grupos-empresariais/${crypto.randomUUID()}`;
                const { error } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                if (error) console.error('Error uploading banner:', error);
                else finalBannerUrl = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath).data.publicUrl;
            }
        }

        let finalPhotoUrl = data.responsiblePhotoUrl;
        if (data.responsiblePhotoUrl && data.responsiblePhotoUrl.startsWith('data:image/')) {
            const file = dataURLtoFile(data.responsiblePhotoUrl, `photo-${groupId}-${Date.now()}`);
            if (file) {
                const filePath = `public/grupos-empresariais/${crypto.randomUUID()}`;
                const { error } = await supabase.storage.from('estoqueinteligentetriad3').upload(filePath, file);
                if (error) console.error('Error uploading photo:', error);
                else finalPhotoUrl = supabase.storage.from('estoqueinteligentetriad3').getPublicUrl(filePath).data.publicUrl;
            }
        }

        const updateData = {
            banner_url: finalBannerUrl,
            responsible_photo_url: finalPhotoUrl,
        };

        const { data: updatedData, error } = await supabase.from('grupos_empresariais').update(updateData).eq('id', groupId).select().single();
        if (error) {
            console.error("Error updating grupo profile:", error);
            return null;
        }

        const updatedGrupo = mapGrupoFromDB(updatedData);
        setGruposEmpresariais(prev => prev.map(g => g.id === groupId ? updatedGrupo : g));
        return updatedGrupo;
    };

    const updateGrupoUserPassword = async (groupId: string, currentPassword: string, newPassword: string) => {
        const { data: user, error: fetchError } = await supabase
            .from('grupos_empresariais')
            .select('encrypted_password')
            .eq('id', groupId)
            .single();

        if (fetchError || !user) {
            return { success: false, message: 'Usuário não encontrado.' };
        }
        if (user.encrypted_password !== currentPassword) {
            return { success: false, message: 'A senha atual está incorreta.' };
        }
        const { error: updateError } = await supabase
            .from('grupos_empresariais')
            .update({ encrypted_password: newPassword })
            .eq('id', groupId);

        if (updateError) {
            return { success: false, message: 'Não foi possível alterar a senha.' };
        }
        return { success: true, message: 'Senha alterada com sucesso!' };
    };

    const addNotification = (message: string, recipientRole: UserRole, userId?: string) => {
        const newNotification: Notification = {
            id: crypto.randomUUID(),
            message,
            recipientRole,
            userId,
            date: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const value: DataContextType = {
        isLoading,
        companies,
        vehicles,
        teamMembers,
        reminders,
        maintenanceRecords,
        deactivatedAdVehicleIds,
        notifications,
        materialRequests,
        adminUsers,
        adminNotifications,
        logs,
        prospectaiLeads,
        gruposEmpresariais,
        updateCompanyStatus,
        addCompany,
        updateCompany,
        deleteCompany,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        markVehicleAsSold,
        assignSalesperson,
        toggleVehiclePriority,
        toggleVehicleAdStatus,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        // Mocked functions for brevity in this response
        addReminder: async () => console.log('addReminder not implemented'),
        updateReminder: async () => console.log('updateReminder not implemented'),
        deleteReminder: async () => console.log('deleteReminder not implemented'),
        markAdAsDeactivated: () => console.log('markAdAsDeactivated not implemented'),
        addNotification,
        markNotificationAsRead: () => console.log('markNotificationAsRead not implemented'),
        addMaterialRequest: () => console.log('addMaterialRequest not implemented'),
        addAdminUser,
        updateAdminUser: async () => console.log('updateAdminUser not implemented'),
        deleteAdminUser: async () => console.log('deleteAdminUser not implemented'),
        addAdminNotification,
        markAdminNotificationAsRead,
        logActivity,
        updateUserPassword,
        updateAdminPassword,
        updateGrupoUserPassword,
        updateGrupoUserProfile,
        updateProspectLeadStatus,
        addProspectLeadFeedback,
        addGrupoEmpresarial,
        updateGrupoEmpresarial,
        updateGrupoCompanies,
        updateGrupoEmpresarialStatus,
    };


    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};