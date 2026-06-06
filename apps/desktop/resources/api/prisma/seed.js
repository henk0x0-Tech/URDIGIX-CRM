"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('[Seed] Seeding database...');
    // 1. Roles
    const rolesData = [
        { name: client_1.RoleType.SUPER_ADMIN, displayName: 'Super Admin', description: 'System developer / owner with all rights', isSystem: true },
        { name: client_1.RoleType.ADMIN, displayName: 'Administrator', description: 'Administrative staff', isSystem: true },
        { name: client_1.RoleType.MANAGER, displayName: 'Project Manager', description: 'Manages teams and projects', isSystem: true },
        { name: client_1.RoleType.EMPLOYEE, displayName: 'Employee', description: 'Standard staff member', isSystem: true },
        { name: client_1.RoleType.VIEWER, displayName: 'Viewer', description: 'Read-only access for audits/clients', isSystem: true },
    ];
    const roles = {};
    for (const r of rolesData) {
        roles[r.name] = await prisma.role.upsert({
            where: { name: r.name },
            update: {},
            create: r,
        });
    }
    console.log('[Seed] Created default roles.');
    // 2. Permissions
    const modules = ['clients', 'projects', 'tasks', 'invoices', 'payments', 'employees', 'documents', 'settings'];
    const actions = ['create', 'read', 'update', 'delete', 'export'];
    const permissions = [];
    for (const module of modules) {
        for (const action of actions) {
            const p = await prisma.permission.upsert({
                where: { module_action: { module, action } },
                update: {},
                create: {
                    module,
                    action,
                    description: `Allow ${action} on ${module}`,
                },
            });
            permissions.push(p);
        }
    }
    console.log('[Seed] Created system permissions.');
    // Map permissions to Roles
    // Super admin gets all automatically (checked in middleware)
    // Admin gets all
    for (const p of permissions) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: roles[client_1.RoleType.ADMIN].id, permissionId: p.id } },
            update: {},
            create: {
                roleId: roles[client_1.RoleType.ADMIN].id,
                permissionId: p.id,
            },
        });
        // Manager gets read/create/update on all except settings
        if (p.module !== 'settings' && ['read', 'create', 'update'].includes(p.action)) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: roles[client_1.RoleType.MANAGER].id, permissionId: p.id } },
                update: {},
                create: {
                    roleId: roles[client_1.RoleType.MANAGER].id,
                    permissionId: p.id,
                },
            });
        }
        // Employee gets read on all, create/update on tasks
        if (p.action === 'read' || (p.module === 'tasks' && ['create', 'update'].includes(p.action))) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: roles[client_1.RoleType.EMPLOYEE].id, permissionId: p.id } },
                update: {},
                create: {
                    roleId: roles[client_1.RoleType.EMPLOYEE].id,
                    permissionId: p.id,
                },
            });
        }
        // Viewer gets read-only on everything
        if (p.action === 'read') {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: roles[client_1.RoleType.VIEWER].id, permissionId: p.id } },
                update: {},
                create: {
                    roleId: roles[client_1.RoleType.VIEWER].id,
                    permissionId: p.id,
                },
            });
        }
    }
    console.log('[Seed] Associated permissions with roles.');
    // 3. Admin User
    const passwordHash = await bcryptjs_1.default.hash('Admin@123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@urdigix.com' },
        update: {},
        create: {
            email: 'admin@urdigix.com',
            passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            isEmailVerified: true,
            isActive: true,
        },
    });
    // Assign Super Admin role to user
    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: roles[client_1.RoleType.SUPER_ADMIN].id } },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: roles[client_1.RoleType.SUPER_ADMIN].id,
        },
    });
    console.log('[Seed] Created default Super Admin user (admin@urdigix.com / Admin@123).');
    // 4. Sample Clients
    const clientsData = [
        { companyName: 'TechCorp Solutions', contactPerson: 'Rajesh Kumar', email: 'rajesh@techcorp.in', phone: '9876543210', status: 'ACTIVE', gstNumber: '29AABCT1234A1Z1' },
        { companyName: 'StartupXYZ Hub', contactPerson: 'Priya Sharma', email: 'priya@startupxyz.co', phone: '9812345670', status: 'ACTIVE', gstNumber: '29AABCS1234A1Z2' },
        { companyName: 'DataSoft Ltd', contactPerson: 'Amit Patel', email: 'amit@datasoft.net', phone: '9900112233', status: 'ACTIVE', gstNumber: '29AABCD1234A1Z3' },
        { companyName: 'Creative Agency', contactPerson: 'Neha Gupta', email: 'neha@creative.com', phone: '9888776655', status: 'ACTIVE' },
    ];
    const clients = [];
    for (const c of clientsData) {
        const client = await prisma.client.upsert({
            where: { email: c.email },
            update: {},
            create: c,
        });
        clients.push(client);
    }
    console.log('[Seed] Created sample clients.');
    // 5. Sample Projects
    if (clients.length > 0) {
        const projectsData = [
            { name: 'Website Redesign', clientId: clients[0].id, managerId: adminUser.id, budget: 150000, status: 'IN_PROGRESS', priority: 'HIGH' },
            { name: 'Mobile App Design', clientId: clients[1].id, managerId: adminUser.id, budget: 350000, status: 'IN_PROGRESS', priority: 'CRITICAL' },
            { name: 'Dashboard UI Development', clientId: clients[2].id, managerId: adminUser.id, budget: 220000, status: 'PLANNING', priority: 'MEDIUM' },
        ];
        for (const p of projectsData) {
            await prisma.project.create({
                data: p,
            });
        }
        console.log('[Seed] Created sample projects.');
    }
    console.log('[Seed] Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map