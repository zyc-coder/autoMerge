const TODAY = new Date().toLocaleDateString().split('/').map(item => item < 10 ? ('0'+item) : item).join('-')
const TODAY_RELEASE = `release-a-${TODAY}` // ,${TODAY_RELEASE}
const TODAY_HOTFIX = `hotfix-${TODAY}` // ,${TODAY_HOTFIX}
const PROJECT_MAP = {
	'admin.pc.b2bMall': '商城',
	'admin.b2bOperationPlatform': '运营中台',
	'admin.b2bSupplierSaas': '供方SAAS',
	'admin.b2bConsumerSaas': '需方SAAS',
	'admin.pc.b2bBid': '招采门户',
	'admin.b2bFinancePlatform': '金融',
	'build-crm-pc': 'crm'
}
module.exports = {
    PROJECT_MAP,
    FN_TYPE: 1,
    // FN_TYPE:
    // 1 mergeBranch(以下3字段必填)；【PROJECT】项目的【CUR_BRANCH】分支合并到【TARGET_BRANCH】分支
    // 2 addBranch（只需要配置PROJECT && CUR_BRANCH）：【PROJECT】项目新建【CUR_BRANCH】

    // PROJECT: 'admin.b2bOperationPlatform,admin.b2bSupplierSaas', // 项目名称（支持多个：'branch-a,branch-b'）
    // CUR_BRANCH: 'feature-PRODUCT-2936', // 当前分支
    // TARGET_BRANCH: `test-a,${TODAY_RELEASE}` // 目标分支（支持多个：'test-a,release-a-2023-08-16,release-a-2023-09-07,hotfix-2023-09-08'）

    // PROJECT: 'admin.b2bConsumerSaas', // 项目名称（支持多个：'branch-a,branch-b'）
    // CUR_BRANCH: `feature-PRODUCT-3083`, // 当前分支
    // TARGET_BRANCH: `test-a` // 目标分支（支持多个：'test-a,release-a-2023-08-16,release-a-2023-09-07,hotfix-2023-09-08'）

    // PROJECT: 'admin.b2bOperationPlatform', // 项目名称（支持多个：'branch-a,branch-b'）
    // CUR_BRANCH: `feature-PRODUCT-3184`, // 当前分支
    // TARGET_BRANCH: `test-a,${TODAY_RELEASE}` // 目标分支（支持多个：'test-a,release-a-2023-08-16,release-a-2023-09-07,hotfix-2023-09-08'）

    // PROJECT: 'admin.pc.b2bMall', // 项目名称（支持多个：'branch-a,branch-b'）
    // CUR_BRANCH: `feature-PRODUCT-3127`, // 当前分支
    // TARGET_BRANCH: `-dev-a,test-a,${TODAY_RELEASE}` // 目标分支（支持多个：'test-a,release-a-2023-08-16,release-a-2023-09-07,hotfix-2023-09-08'）

    PROJECT: 'admin.b2bSupplierSaas,admin.b2bConsumerSaas', // 项目名称（支持多个：'branch-a,branch-b'）
    CUR_BRANCH: `feature-PRODUCT-3172`, // 当前分支
    TARGET_BRANCH: `test-a,${TODAY_RELEASE}` // 目标分支（支持多个：'test-a,release-a-2023-08-16,release-a-2023-09-07,hotfix-2023-09-08'）
    
    // PROJECT: 'admin.b2bSupplierSaas,admin.pc.b2bBid', // 项目名称（支持多个：'branch-a,branch-b'）
    // CUR_BRANCH: `feature-PRODUCT-3111`, // 当前分支
    // TARGET_BRANCH: `test-a,-${'release-a-2024-03-08'}` // 目标分支（支持多个：'test-a,release-a-2023-08-16,release-a-2023-09-07,hotfix-2023-09-08'）

    // PROJECT: 'admin.b2bConsumerSaas', // 项目名称（支持多个：'branch-a,branch-b'）
    // CUR_BRANCH: `feature-PORDUCT-3111`, // 当前分支
    // TARGET_BRANCH: `test-a,-${'release-a-2024-03-08'}` // 目标分支（支持多个：'test-a,release-a-2023-08-16,release-a-2023-09-07,hotfix-2023-09-08'）
}
