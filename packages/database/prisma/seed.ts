import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ivan = await prisma.driver.upsert({
    where: { phone: '+79990000001' },
    update: {},
    create: {
      name: 'Иван Петров',
      phone: '+79990000001',
      licenseCategories: ['B', 'C'],
    },
  });

  const marina = await prisma.driver.upsert({
    where: { phone: '+79990000002' },
    update: {},
    create: {
      name: 'Марина Волкова',
      phone: '+79990000002',
      licenseCategories: ['B', 'C', 'CE'],
    },
  });

  await Promise.all([
    prisma.vehicle.upsert({
      where: { plateNumber: 'А123ВС77' },
      update: { driverId: ivan.id },
      create: {
        plateNumber: 'А123ВС77',
        type: 'REFRIGERATOR',
        capacity: 10,
        status: 'AVAILABLE',
        city: 'Москва',
        driverId: ivan.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { plateNumber: 'М456ОР16' },
      update: { driverId: marina.id },
      create: {
        plateNumber: 'М456ОР16',
        type: 'TENT',
        capacity: 20,
        status: 'AVAILABLE',
        city: 'Казань',
        driverId: marina.id,
      },
    }),
    prisma.vehicle.upsert({
      where: { plateNumber: 'С789АА50' },
      update: {},
      create: {
        plateNumber: 'С789АА50',
        type: 'VAN',
        capacity: 3.5,
        status: 'SERVICE',
        city: 'Москва',
      },
    }),
  ]);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
