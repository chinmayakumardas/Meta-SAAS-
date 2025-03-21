const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

dotenv.config();

const permissions = [
  { name: 'permission.read' },
  { name: 'permission.write' },
  { name: 'permission.delete' },
  { name: 'permission.update' }
];

const roles = [
  { name: 'superAdmin', permissions: ['permission.read', 'permission.write', 'permission.delete', 'permission.update'] },
  { name: 'admin', permissions: ['permission.read', 'permission.write', 'permission.update'] },
  { name: 'tenantAdmin', permissions: ['permission.read'] },
  { name: 'guest', permissions: ['permission.read'] }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Permission.deleteMany({});
    await Role.deleteMany({});

    const createdPermissions = await Permission.insertMany(permissions);

    for (let role of roles) {
      const rolePermissions = createdPermissions.filter(p => role.permissions.includes(p.name));
      await Role.create({ name: role.name, permissions: rolePermissions.map(p => p._id) });
    }

    console.log('Seeding done.');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
