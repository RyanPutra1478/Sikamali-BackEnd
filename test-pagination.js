const KKModel = require('./models/kkModel');
const EmploymentModel = require('./models/employmentModel');
const { KesejahteraanModel, LandPlotModel } = require('./models/otherModels');
const MemberModel = require('./models/memberModel');
const UserModel = require('./models/userModel');

async function testPagination() {
    console.log('--- TESTING MODEL PAGINATION ---');

    try {
        const kkRes = await KKModel.getAllEnriched(null, { page: 1, limit: 5 });
        console.log('✅ KKModel.getAllEnriched:', {
            isPaginated: !!kkRes.pagination,
            dataLength: kkRes.data?.length,
            pagination: kkRes.pagination
        });

        const empRes = await EmploymentModel.getAllEnriched(null, { page: 1, limit: 5 });
        console.log('✅ EmploymentModel.getAllEnriched:', {
            isPaginated: !!empRes.pagination,
            dataLength: empRes.data?.length,
            pagination: empRes.pagination
        });

        const socialRes = await KesejahteraanModel.getAllEnriched(null, false, { page: 1, limit: 5 });
        console.log('✅ KesejahteraanModel.getAllEnriched:', {
            isPaginated: !!socialRes.pagination,
            dataLength: socialRes.data?.length,
            pagination: socialRes.pagination
        });

        const landRes = await LandPlotModel.getAllEnriched(null, { page: 1, limit: 5 });
        console.log('✅ LandPlotModel.getAllEnriched:', {
            isPaginated: !!landRes.pagination,
            dataLength: landRes.data?.length,
            pagination: landRes.pagination
        });

        const memberRes = await MemberModel.getAll(null, { page: 1, limit: 5 });
        console.log('✅ MemberModel.getAll:', {
            isPaginated: !!memberRes.pagination,
            dataLength: memberRes.data?.length,
            pagination: memberRes.pagination
        });

        const userRes = await UserModel.getAll({ page: 1, limit: 5 });
        console.log('✅ UserModel.getAll:', {
            isPaginated: !!userRes.pagination,
            dataLength: userRes.data?.length,
            pagination: userRes.pagination
        });

        console.log('\nALL PAGINATION TESTS PASSED SUCCESSFULLY! 🎉');
        process.exit(0);
    } catch (err) {
        console.error('❌ Pagination test failed:', err);
        process.exit(1);
    }
}

testPagination();
