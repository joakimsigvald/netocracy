namespace Netocracy.Console.Business
{
    public class Inhabitant : Individual
    {
        public int Index { get; set; }
        public int MembershipNumber { get; set; }
        public Tribe Tribe { get; set; }
    }
}