using System;
using System.Linq;
using Xunit;

namespace Netocracy.Console.Business.Test
{
    public class TribeComputer2Tests
    {
        [Fact]
        public void GivenNoIndividuals_ReturnNoTribes()
        {
            var individuals = Array.Empty<Individual>();

            var tribes = TribeComputer2.ComputeTribes(individuals);

            Assert.Empty(tribes);
        }

        [Fact]
        public void GivenOneIndividuals_ReturnNoTribe()
        {
            var individual = Create(1);

            var tribes = TribeComputer2.ComputeTribes(new[] { individual });

            Assert.Empty(tribes);
        }

        [Fact]
        public void GivenTwoFriends_ReturnOneTribe()
        {
            var a = Create(1, 0, 1);
            var b = Create(2, 1, 0);

            var tribes = TribeComputer2.ComputeTribes(a, b);

            var tribe = Assert.Single(tribes);
            Assert.Equal(2, tribe.Members.Count);
            Assert.Equal(a, tribe.Members[0].Individual);
            Assert.Equal(b, tribe.Members[1].Individual);
            Assert.Equal($"{a.Id}-{b.Id}", tribe.Name);
            Assert.Equal(2, tribe.FoundingBond);
        }

        [Fact]
        public void GivenOneIndividualAdmiringAnother_ReturnOneTribe()
        {
            var a = Create(1, 0, 0);
            var b = Create(2, 1, 0);

            var tribes = TribeComputer2.ComputeTribes(a, b);

            var tribe = Assert.Single(tribes);
            Assert.Equal(2, tribe.Members.Count);
            Assert.Equal(b, tribe.Members[0].Individual);
            Assert.Equal(a, tribe.Members[1].Individual);
            Assert.Equal($"{b.Id}-{a.Id}", tribe.Name);
            Assert.Equal(1, tribe.FoundingBond);
        }

        [Fact]
        public void GivenTwoFriendsAndOneLoner_ReturnOneTribesWithTheFriends()
        {
            var a = Create(1, 0, 1, 0);
            var b = Create(2, 1, 0, 0);
            var c = Create(3, 0, 0, 0);

            var tribes = TribeComputer2.ComputeTribes(a, b, c);

            var tribe = Assert.Single(tribes);
            Assert.Equal(2, tribe.Members.Count);
            Assert.Equal(a, tribe.Members[0].Individual);
            Assert.Equal(b, tribe.Members[1].Individual);
        }

        [Fact]
        public void GivenThreeFriends_ReturnOneTribe()
        {
            var a = Create(1, 0, 1, 1);
            var b = Create(2, 1, 0, 1);
            var c = Create(3, 1, 1, 0);

            var tribes = TribeComputer2.ComputeTribes(a, b, c);

            var tribe = Assert.Single(tribes);
            Assert.Equal(3, tribe.Members.Count);
            Assert.Equal(a, tribe.Members[0].Individual);
            Assert.Equal(b, tribe.Members[1].Individual);
            Assert.Equal(c, tribe.Members[2].Individual);
            Assert.Equal(2, tribe.FoundingBond);
        }

        [Fact]
        public void GivenTwoCouplesWhoAreMostlyEnemies_ReturnTwoTribes()
        {
            var a = Create(1, 0, 1, 1, -1);
            var b = Create(2, 1, 0, -1, -1);
            var c = Create(3, 1, -1, 0, 1);
            var d = Create(4, -1, -1, 1, 0);

            var tribes = TribeComputer2.ComputeTribes(a, b, c, d);

            Assert.Equal(2, tribes.Length);
            Assert.Equal(2, tribes[0].Members.Count);
            Assert.Equal(2, tribes[1].Members.Count);
            Assert.Equal(a, tribes[0].Members[0].Individual);
            Assert.Equal(b, tribes[0].Members[1].Individual);
            Assert.Equal(c, tribes[1].Members[0].Individual);
            Assert.Equal(d, tribes[1].Members[1].Individual);
        }

        [Fact]
        public void GivenTwoCouplesWhoAreFriendsExceptTwoWhoDislikeEachother_ReturnTwoTribes()
        {
            var a = Create(1, 0, 1, 1, -1);
            var b = Create(2, 1, 0, 1, 1);
            var c = Create(3, 1, 1, 0, 1);
            var d = Create(4, -1, 1, 1, 0);

            var tribes = TribeComputer2.ComputeTribes(a, b, c, d);

            Assert.Equal(2, tribes.Length);
            Assert.Equal(2, tribes[0].Members.Count);
            Assert.Equal(2, tribes[1].Members.Count);
            Assert.Equal(a, tribes[0].Members[0].Individual);
            Assert.Equal(b, tribes[0].Members[1].Individual);
            Assert.Equal(c, tribes[1].Members[0].Individual);
            Assert.Equal(d, tribes[1].Members[1].Individual);
        }

        private Individual Create(int id, params float[] trusts)
            => new()
            {
                Id = id,
                Peers = trusts
                .Select((v, i) => (v, i))
                .Where(t => t.v != 0)
                .Select(t => new Peer { Index = t.i, Trust = t.v})
                .ToArray()
            };
    }
}
