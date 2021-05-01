using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Netocracy.Console.Business.Test
{
    public class TribeServiceTests
    {
        [Fact]
        public async Task GivenNoIndividuals_GetNoTribes()
        {
            var service = new TribeService();
            var tribes = await service.ComputeTribes();
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenOneIndividualWithNoFriends_GetNoTribes()
        {
            var service = new TribeService();
            var individual = CreateIndividual(1);
            var tribes = await service.ComputeTribes(individual);
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenOneIndividualWithUnknownFriend_GetNoTribes()
        {
            var service = new TribeService();
            var individual = CreateIndividual(1, 2);
            var tribes = await service.ComputeTribes(individual);
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenTwoIsolatedIndividuals_GetNoTribes()
        {
            var service = new TribeService();
            var individuals = new[]
            {
                CreateIndividual(1),
                CreateIndividual(2)
            };
            var tribes = await service.ComputeTribes(individuals);
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenTwoConnectedIndividuals_GetOneTribe()
        {
            var service = new TribeService();
            var individuals = new[]
            {
                CreateIndividual(1, 2),
                CreateIndividual(2, 1)
            };

            var tribes = await service.ComputeTribes(individuals);

            var tribe = Assert.Single(tribes);
            Assert.Equal("2-1", tribe.Id);
            Assert.Equal(2, tribe.Members.Length);
            Assert.Equal(individuals[1], tribe.Members[0].Individual);
            Assert.Equal(individuals[0], tribe.Members[1].Individual);
        }

        private static Individual CreateIndividual(int id, params int[] friends)
            => new()
            {
                Id = id,
                Peers = friends.Select(f => new Peer { TargetId = f, Trust = 1 }).ToArray()
            };
    }
}