using System.Linq;
using Xunit;

namespace Netocracy.Console.Business.Test
{
    public class IndividualComputerTests
    {
        [Theory]
        [InlineData(1, 0, 0, 10, "1:")]
        [InlineData(2, 0, 0, 10, "1:", "2:")]
        [InlineData(2, 1, 0, 10, "1:+2", "2:+1")]
        [InlineData(2, 0, 1, 10, "1:-2", "2:-1")]
        [InlineData(3, 1, 0, 10, "1:+2,+3", "2:+1", "3:+1")]
        [InlineData(3, 1, 1, 10, "1:+2,-3", "2:+1,-3", "3:+1,-2")]
        [InlineData(3, 1, 0, 1, "1:+2", "2:+1,+3", "3:+2")]
        [InlineData(4, 1, 0, 10, "1:+2,+3", "2:+1", "3:+1,+4", "4:+3")]
        [InlineData(4, 1, 0, 1, "1:+2", "2:+1,+3", "3:+2,+4", "4:+3")]
        [InlineData(5, 1, 0, 10, "1:+2,+3", "2:+1", "3:+1,+4", "4:+3,+5", "5:+4")]
        [InlineData(5, 1, 0, 1, "1:+2", "2:+1,+3", "3:+2,+4", "4:+3,+5", "5:+4")]
        [InlineData(6, 1, 0, 10, "1:+2,+3", "2:+1", "3:+1,+4", "4:+3,+5", "5:+4,+6", "6:+5")]
        public void TestGenerate(int count, int friends, int foes, int horizon, params string[] expected)
        {
            var expectedIndividuals = expected.Select(ParseIndividual).ToArray();
            var actual = IndividualComputer.GenerateIndividuals(count, friends, foes, horizon);
            Assert.Equal(count, actual.Length);
            for (var i = 0; i < count; i++)
            {
                Assert.Equal(expectedIndividuals[i], actual[i]);
            }
        }

        private Individual ParseIndividual(string representation)
        {
            var parts = representation.Split(':');
            var id = int.Parse(parts[0]);
            var peers = parts[1].Split(',', System.StringSplitOptions.RemoveEmptyEntries);
            var friends = peers.Where(p => p[0] == '+').Select(s => new Peer(int.Parse(s[1..]), 1)).ToArray();
            var foes = peers.Where(p => p[0] == '-').Select(s => new Peer(int.Parse(s[1..]), 1)).ToArray();
            return new Individual
            {
                Id = id,
                Peers = friends.Concat(foes).ToArray()
            };
        }

        [Theory]
        [InlineData(1, 0, 0)]
        [InlineData(2, 0, 0)]
        [InlineData(2, 1, 1)]
        [InlineData(3, 0, 2)]
        [InlineData(3, 1, 1)]
        [InlineData(3, 2, 0)]
        [InlineData(4, 0, 2)]
        [InlineData(4, 1, 1)]
        [InlineData(4, 2, 3)]
        [InlineData(4, 3, 0)]
        [InlineData(5, 0, 4)]
        [InlineData(5, 1, 8)]
        [InlineData(5, 2, 12)]
        [InlineData(5, 3, 1)]
        [InlineData(5, 4, 0)]
        [InlineData(6, 0, 4)]
        [InlineData(6, 1, 8)]
        [InlineData(6, 2, 12)]
        [InlineData(6, 3, 1)]
        [InlineData(6, 4, 5)]
        [InlineData(6, 5, 0)]
        public void TestStocasticShift(int count, int number, int expected)
        {
            var shifter = IndividualComputer.StocasticShifter(count);
            var actual = shifter(number);
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void CanSerializeAndDeserialize()
        {
            var individuals = IndividualComputer.GenerateIndividuals(100, 10, 2, 100);
            var str = IndividualComputer.SerializeIndividuals(individuals);
            var deserialized = IndividualComputer.DeserializeIndividuals(str);
            Assert.Equal(individuals, deserialized);
        }
    }
}