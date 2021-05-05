using System;
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
            var tribes = await ComputeTribes();
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenOneIndividualWithNoFriends_GetNoTribes()
        {
            var individual = CreateIndividual(1, Array.Empty<int>());
            var tribes = await ComputeTribes(individual);
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenOneIndividualWithUnknownFriend_GetNoTribes()
        {
            var individual = CreateIndividual(1, 2);
            var tribes = await ComputeTribes(individual);
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenTwoIsolatedIndividuals_GetNoTribes()
        {
            var individuals = new[]
            {
                CreateIndividual(1, Array.Empty<int>()),
                CreateIndividual(2, Array.Empty<int>())
            };
            var tribes = await ComputeTribes(individuals);
            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenTwoConnectedIndividuals_GetOneTribe()
        {
            var individuals = new[]
            {
                CreateIndividual(1, 2),
                CreateIndividual(2, 1)
            };

            var tribes = await ComputeTribes(individuals);

            var tribe = Assert.Single(tribes);
            Assert.Equal("2-1", tribe.Id);
            AssertMembers(individuals, tribe, 1, 0);
        }

        [Fact]
        public async Task GivenTwoFoes_GetNoTribe()
        {
            var tribes = await ComputeTribes(new(1, new Peer(2, -1)), new(2, new Peer(1, -1)));

            Assert.Empty(tribes);
        }

        [Fact]
        public async Task GivenThreeConnectedIndividuals_GetOneTribe()
        {
            var individuals = new[]
            {
                CreateIndividual(1, 2),
                CreateIndividual(2, 1, 3),
                CreateIndividual(3, 2),
            };

            var tribes = await ComputeTribes(individuals);

            var tribe = Assert.Single(tribes);
            Assert.Equal("2-1", tribe.Id);
            AssertMembers(individuals, tribe, 1, 0, 2);
        }

        [Fact]
        public async Task GivenFourCircularlyConnectedIndividuals_GetOneTribe()
        {
            var individuals = new[]
            {
                CreateIndividual(1, 4, 2),
                CreateIndividual(2, 1, 3),
                CreateIndividual(3, 2, 4),
                CreateIndividual(4, 3, 1),
            };

            var tribes = await ComputeTribes(individuals);

            var tribe = Assert.Single(tribes);
            Assert.Equal("4-3", tribe.Id);
            AssertMembers(individuals, tribe, 3, 2, 1, 0);
        }

        [Fact]
        public async Task GivenFourFriendsWithAModerateConflict_TheyStillFormOneTribe()
        {
            var individuals = new[]
            {
                CreateIndividual(1, 2, 3, 4),
                CreateIndividual(2, 1, 3, 4),
                CreateIndividual(3, 1, 2, 4),
                CreateIndividual(4, 1, 2, 3),
            };
            individuals[0].Peers[0].Trust = -1;

            var tribes = await ComputeTribes(individuals);

            var tribe = Assert.Single(tribes);
            Assert.Equal("3-1", tribe.Id);
            AssertMembers(individuals, tribe, 2, 0, 3, 1);
        }

        [Fact]
        public async Task GivenFourFriendsWithASeriousConflict_TheyFormTwoTribes()
        {
            var individuals = new[]
            {
                CreateIndividual(1, 2, 3, 4),
                CreateIndividual(2, 1, 3, 4),
                CreateIndividual(3, 1, 2, 4),
                CreateIndividual(4, 1, 2, 3),
            };
            individuals[0].Peers[1].Trust = -1;
            individuals[1].Peers[1].Trust = -1;
            individuals[2].Peers[0].Trust = -1;
            individuals[3].Peers[0].Trust = -1;

            var tribes = await ComputeTribes(individuals);

            Assert.Equal(2, tribes.Length);
            var tribe1 = tribes[0];
            var tribe2 = tribes[1];
            Assert.Equal("2-1", tribe1.Id);
            AssertMembers(individuals.Take(2).ToArray(), tribe1, 1, 0);
            Assert.Equal("4-3", tribe2.Id);
            AssertMembers(individuals.Skip(2).ToArray(), tribe2, 1, 0);
        }

        [Fact]
        public async Task GivenDifferentTrust_ChooseMoreTrustedPeerFirst() {
            var individuals = new[]
            {
                CreateIndividual(1, 0f, 0.2f, 0.5f, 0.3f),
                CreateIndividual(2, 0.2f, 0f, 0.5f, 0.3f),
                CreateIndividual(3, 0.2f, 0.5f, 0f, 0.3f),
                CreateIndividual(4, 0.2f, 0.5f, 0.3f, 0f),
            };

            var tribes = await ComputeTribes(individuals);

            var tribe = Assert.Single(tribes);
            Assert.Equal("3-2", tribe.Id);
            AssertMembers(individuals, tribe, 2, 1, 3, 0);
            Assert.Equal(0, tribe.Admiration);
        }

        [Fact]
        public async Task GivenFiveCircularlyConnectedIndividuals_GetOneTribe()
        {
            var individuals = new[]
            {
                CreateIndividual(1, 5, 2),
                CreateIndividual(2, 1, 3),
                CreateIndividual(3, 2, 4),
                CreateIndividual(4, 3, 5),
                CreateIndividual(5, 4, 1),
            };

            var tribes = await ComputeTribes(individuals);

            var tribe = Assert.Single(tribes);
            Assert.Equal("5-4", tribe.Id);
            AssertMembers(individuals, tribe, 4, 3, 1, 0, 2);
        }

        [Fact]
        public async Task GivenTwoConnectedGroupsOfThree_GetTwoTribes()
        {
            var individuals = new[]
            {
                CreateIndividual(1, 2, 3),
                CreateIndividual(2, 1, 3),
                CreateIndividual(3, 1, 2),
                CreateIndividual(4, 5, 6),
                CreateIndividual(5, 4, 6),
                CreateIndividual(6, 4, 5),
            };

            var tribes = await ComputeTribes(individuals);

            Assert.Equal(2, tribes.Length);
            var tribe1 = tribes[0];
            var tribe2 = tribes[1];
            Assert.Equal("2-1", tribe1.Id);
            AssertMembers(individuals.Take(3).ToArray(), tribe1, 1, 0, 2);
            Assert.Equal("5-4", tribe2.Id);
            AssertMembers(individuals.Skip(3).ToArray(), tribe2, 1, 0, 2);
        }

        private static Task<Tribe[]> ComputeTribes(params Individual[] individuals)
            => new TribeService().ComputeTribes(individuals);

        private static void AssertMembers(Individual[] individuals, Tribe tribe, params int[] order)
        {
            Assert.Equal(order.Length, tribe.Members.Length);
            for (var i = 0; i < order.Length; i++)
                Assert.Equal(individuals[order[i]].Id, tribe.Members[i].Id);
        }

        private static Individual CreateIndividual(int id, params int[] friends)
            => new(id, friends.Select(f => new Peer(f, 1f / friends.Length)).ToArray());

        private static Individual CreateIndividual(int id, params float[] trusts)
            => new(id, trusts.Select((t, i) => new Peer(i + 1, t)).Where(p => p.TargetId != id).ToArray());
    }
}